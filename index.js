import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CAPI Server funcionando 🚀");
});

app.post("/capi", (req, res) => {
  console.log("Payload recebido:", req.body);
  return res.json({ status: "ok", recebido: req.body });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
