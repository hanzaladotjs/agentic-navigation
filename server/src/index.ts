import express, { Request, Response } from "express"
import { AssemblyAI } from "assemblyai"
import dotenv from "dotenv"
import multer from "multer"
import cors from "cors"

dotenv.config()

const upload = multer()
const app = express()

app.use(express.json())
app.use(cors())

app.post("/audio", upload.single("audio_file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" })
    }

    // ✅ Correct way
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLY_AI!,
    })

    // Upload the audio buffer
    const uploadedFile:any = await client.files.upload(req.file.buffer)
    
    console.log("Uploaded file:", uploadedFile)

    // Request transcript
    const transcript = await client.transcripts.transcribe({
      audio: uploadedFile.upload_url,
      speech_model: "universal",
    })

    if (transcript.status === "error") {
      return res.status(500).json({ error: transcript.error })
    }

    res.json({ message: transcript.text })
  } catch (err: any) {
    console.error("Server error:", err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => console.log("listening on port 3000"))
