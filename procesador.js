const Jimp = require("jimp");
const fs = require("fs-extra");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fetch = require("node-fetch");

const videoEncoder = "h264";
const input = "input.mp4";
const output = "output.mp4";

async function processFrames(frames) {
  let requests = [];
  for (let i = 1; i <= frames.length; i++) {
    requests.push(fetch("http://localhost:8000/" + i));
  }
  return Promise.all(requests);
}

// async function processFrames(frames){
//   for(let i = 1; i <= frames.length; i++){
//     await fetch("http://localhost:8000/" + i);
//   }
// }

(async function () {
  try {
    console.log("Iniciando archivos temporales");
    await fs.mkdir("temp");
    await fs.mkdir("temp/raw-frames");
    await fs.mkdir("temp/edited-frames");

    console.log("Decodificando");
    await exec(`ffmpeg -i ${input} temp/raw-frames/%d.png`);

    console.log("Renderizando");
    const frames = fs.readdirSync("temp/raw-frames");
    await processFrames(frames);

    console.log("Encodificando");
    await exec(
      `ffmpeg -start_number 1 -i temp/edited-frames/%d.png -vcodec ${videoEncoder} -filter:v "setpts=0.5*PTS" temp/no-audio.mp4`
    );

    console.log("Añadiendo audio");
    await exec(
      `ffmpeg -i temp/no-audio.mp4 -i input.mp4 -c copy -map 0:v:0 -map 1:a:0 ${output}`
    );

    console.log("Limpiando");
    await fs.remove("temp");
  } catch (error) {
    console.log("Ocurrió un error", error);
  }
})();
