const express = require("express");
const fs = require("fs-extra");
const Jimp = require("jimp");

const app = express();

function onFrame(frame, frameCount) {
  if (frameCount < 5) {
    frame = new Jimp(
      frame.bitmap.width,
      frame.bitmap.height,
      0xff0000ff,
      (err, image) => {}
    );
  } else {
    frame.scan(
      0,
      0,
      frame.bitmap.width,
      frame.bitmap.height,
      function (x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const alpha = this.bitmap.data[idx + 3];
        this.bitmap.data[idx + 2] = 255;
      }
    );
  }
  return frame;
}

app.get("/:frame", async (req, res) => {
  console.log(
    "El frame #" +
      req.params.frame +
      " esta siendo procesado por el servidor con id: " +
      process.pid
  );
  let frame = await Jimp.read(`temp/raw-frames/${req.params.frame}.png`);
  frame = onFrame(frame, req.params.frame);
  await frame.writeAsync(`temp/edited-frames/${req.params.frame}.png`);
  res.status(200).end();
});

app.listen(8000);
