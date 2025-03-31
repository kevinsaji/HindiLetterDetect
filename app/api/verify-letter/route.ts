import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const { imageData, letterIndex } = await request.json();
    console.log("Processing request for letter index:", letterIndex);
    
    if (!imageData || letterIndex === undefined) {
      return NextResponse.json({ error: "Image data and letter index are required" }, { status: 400 });
    }
    
    // Convert base64 to image and save temporarily
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const userDrawingPath = path.join(tempDir, `user_drawing_${Date.now()}.png`);
    fs.writeFileSync(userDrawingPath, base64Data, "base64");
    console.log("User drawing path:", userDrawingPath);
    // Path to the reference image - check if this path is correct
    const baseImagePath = path.join(process.cwd(), 'components', 'base letters', `${letterIndex}.png`);
    console.log("Base image path:", baseImagePath);
    // Check if the base image exists
    if (!fs.existsSync(baseImagePath)) {
      console.error(`Base image not found at: ${baseImagePath}`);
      return NextResponse.json({ error: "Reference image not found" }, { status: 404 });
    }
    
    // Run the Python script to compare images
    //const scriptPath = path.join(process.cwd(), "scripts", "letterdetector.py");
    const scriptPath = "app/scripts/letterdetector.py";
    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`Python script not found at: ${scriptPath}`);
      return NextResponse.json({ error: "Comparison script not found" }, { status: 404 });
    }
    console.log("Script path:", scriptPath);
    const command = `python ${scriptPath} "${userDrawingPath}" "${baseImagePath}" 0.84`;
    console.log("Command:", command);    
    const { stdout, stderr } = await execPromise(command);
    console.log("Script output:", stdout);
    if (stderr) {
      console.error("Script error:", stderr);
    }
    // Parse the output to determine if letters match
    if (stdout.includes("Could not open or find the images")) {
      console.error("Could not open or find the images");
      return NextResponse.json({ error: "Could not open or find the images" }, { status: 500 });
    }
    
    const isMatch = stdout.includes("Are the same letter: YES");
    const similarityMatch = stdout.match(/SSIM score: ([\d.]+)/);
    const similarity = similarityMatch ? parseFloat(similarityMatch[1]) : 0;
    
    console.log("Match result:", isMatch, "Similarity:", similarity);
    
    // Clean up the temporary file
    try {
      fs.unlinkSync(userDrawingPath);
    } catch (cleanupError) {
      console.warn("Failed to clean up temporary file:", cleanupError);
    }
    
    return NextResponse.json({
      isMatch,
      similarity
    });
  } catch (error1) {
    console.error("Error verifying letter:", error1);
    // Return more detailed error information
    return NextResponse.json({ 
      error: error1.message || "Failed to verify letter",
      stack: process.env.NODE_ENV === 'development' ? error1.stack : undefined
    }, { status: 500 });
  }
}

/*
import { NextResponse } from "next/server"
import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const execPromise = promisify(exec)

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), "temp")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

export async function POST(request: Request) {
  try {
    const { imageData, letterIndex } = await request.json()

    if (!imageData || letterIndex === undefined) {
      return NextResponse.json({ error: "Image data and letter index are required" }, { status: 400 })
    }

    // Convert base64 to image and save temporarily
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "")
    const userDrawingPath = path.join(tempDir, `user_drawing_${Date.now()}.png`)
    fs.writeFileSync(userDrawingPath, base64Data, "base64")

    // Path to the reference image
    const baseImagePath = path.join(process.cwd(), "public", "base-images", `${letterIndex}.png`)

    // Run the Python script to compare images
    const scriptPath = path.join(process.cwd(), "scripts", "letterdetector.py")
    const command = `python ${scriptPath} "${userDrawingPath}" "${baseImagePath}" 0.84`

    const { stdout, stderr } = await execPromise(command)

    // Parse the output to determine if letters match
    const isMatch = stdout.includes("Are the same letter: YES")

    // Clean up the temporary file
    fs.unlinkSync(userDrawingPath)

    return NextResponse.json({
      isMatch,
      similarity: Number.parseFloat(stdout.match(/SSIM score: ([\d.]+)/)?.[1] || "0"),
    })
  } catch (error) {
    console.error("Error verifying letter:", error)
    return NextResponse.json({ error: "Failed to verify letter" }, { status: 500 })
  }
}

*/