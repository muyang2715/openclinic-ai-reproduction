import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

import type { AudioSegment } from "../sockets/session";

// fluent-ffmpeg needs an ffmpeg binary; ffmpeg-static ships one cross-platform.
if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);

// Merge the call's audio segments (caller WebM/Opus turns + agent MP3 turns) into
// a single playable MP3. The call is half-duplex/turn-based, so the segments are
// concatenated in chronological order; the ffmpeg concat filter decodes the mixed
// formats and re-encodes one continuous MP3.
export const mergeSegmentsToMp3 = async (
  segments: AudioSegment[],
): Promise<Buffer> => {
  if (segments.length === 0) {
    throw new Error("No audio segments to merge");
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `call-${randomUUID()}-`));
  try {
    const ordered = [...segments].sort((a, b) => a.at - b.at);
    const inputs: string[] = [];
    for (let i = 0; i < ordered.length; i += 1) {
      const seg = ordered[i]!;
      const file = path.join(dir, `${i}.${seg.format}`);
      await fs.writeFile(file, seg.audio);
      inputs.push(file);
    }

    const output = path.join(dir, "recording.mp3");

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg();
      inputs.forEach((file) => command.input(file));
      command
        .complexFilter(
          [
            {
              filter: "concat",
              options: { n: inputs.length, v: 0, a: 1 },
              inputs: inputs.map((_, i) => `${i}:a`),
              outputs: "out",
            },
          ],
          "out",
        )
        .audioCodec("libmp3lame")
        .format("mp3")
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .save(output);
    });

    return await fs.readFile(output);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
};
