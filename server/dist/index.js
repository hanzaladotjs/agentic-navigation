"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assemblyai_1 = require("assemblyai");
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const upload = (0, multer_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/audio", upload.single("audio_file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }
        const apikey = process.env.ASSEMBLY_AI;
        if (!apikey) {
            console.log("no apoi key");
            res.json({
                message: "no api key"
            });
        }
        const client = new assemblyai_1.AssemblyAI({
            apiKey: apikey,
        });
        const uploadedFile = await client.files.upload(req.file.buffer);
        console.log("Uploaded file:", uploadedFile);
        const transcript = await client.transcripts.transcribe({
            audio: uploadedFile,
            speech_model: "universal",
        });
        if (transcript.status === "error") {
            return res.status(500).json({ error: transcript.error });
        }
        res.json({ message: transcript.text });
    }
    catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
app.listen(3000, () => console.log("listening on port 3000"));
