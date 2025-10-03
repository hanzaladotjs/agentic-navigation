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
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const util_1 = require("util");
// import ffmpegPath from 'ffmpeg-static';
const execPromise = (0, util_1.promisify)(child_process_1.exec);
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
        fs_1.default.writeFileSync("input.webm", req.file.buffer);
        await execPromise(`ffmpeg -y -i input.webm output.wav`);
        console.log("Conversion done: output.wav");
        const wavBuffer = fs_1.default.readFileSync("output.wav");
        const client = new assemblyai_1.AssemblyAI({
            apiKey: process.env.ASSEMBLY_AI,
        });
        const uploadedFile = await client.files.upload(wavBuffer);
        console.log("Uploaded file:", uploadedFile.upload_url);
        const transcript = await client.transcripts.transcribe({
            audio: uploadedFile.upload_url,
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
