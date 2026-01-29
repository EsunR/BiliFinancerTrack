import childProcess from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * 将视频与音频进行分离
 */
export async function convertVideoToAudio(videoPath: string) {
  const { dir, name } = path.parse(videoPath);
  const outputPath = path.join(dir, `${name}.mp3`);
  if (fs.existsSync(outputPath)) {
    return outputPath;
  }
  const command = `ffmpeg -y -i "${videoPath}" -vn -acodec libmp3lame -b:a 128k -ar 22050 -ac 1 "${outputPath}"`;
  childProcess.execSync(command, { stdio: 'ignore' });
  return outputPath;
}
