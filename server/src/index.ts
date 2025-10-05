import express, { Request, Response } from "express"
import { AssemblyAI } from "assemblyai"
import dotenv from "dotenv"
import multer from "multer"
import cors from "cors"
import { GoogleGenAI } from "@google/genai"; 
import open from "open"

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
    const apikey= process.env.ASSEMBLY_AI as string

    if(!apikey){
        console.log("no apoi key")
        res.json({
            message: "no api key"
        })
    }

    const client = new AssemblyAI({
      apiKey: apikey,
    })

    const uploadedFile:any = await client.files.upload(req.file.buffer)
    
    console.log("Uploaded file:", uploadedFile)

    
    const transcript = await client.transcripts.transcribe({
      audio: uploadedFile,
      speech_model: "universal",
    })

    if (transcript.status === "error") {
      return res.status(500).json({ error: transcript.error })
    }

    console.log(transcript.text)

    const geminiKey = process.env.GEMINI_API_KEY

    if(!geminiKey){
        console.log("invalid gemini")
        return res.json({
            message: "no ai key"
        })
    }

   const ai = new GoogleGenAI({ apiKey: geminiKey });



  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Extract the target website URL from this voice command: '${transcript.text}'. Handle variations like "go to YouTube" or "open Amazon". Add https:// if missing. Output only the full URL, nothing else. If no URL, output "none".`,
  });

  const targetUrl:any =  result.text?.trim()

  await open(targetUrl)
  
  res.json({ message: `Navigated to: ${targetUrl}` });
  console.log(result.text)
  
}







   catch (err: any) {
    console.error("Server error:", err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => console.log("listening on port 3000"))
