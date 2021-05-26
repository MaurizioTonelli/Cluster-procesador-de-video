const cluster = require("cluster");
const express = require("express");
const http = require("http");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`Balanceador de carga ${process.pid} esta corriendo`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Servidor ${worker.process.pid} murió`);
  });
} else {
  console.log("Servidor " + process.pid + " iniciado");
  require("./servidor.js");
}
