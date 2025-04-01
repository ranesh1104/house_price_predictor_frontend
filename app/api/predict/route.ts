import { type NextRequest, NextResponse } from "next/server"
import { houseDataSchema } from "@/lib/api"

// This is a proxy to your FastAPI backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body against our schema
    const validatedData = houseDataSchema.parse(body)

    // Forward the request to the FastAPI backend
    const apiUrl = process.env.API_URL || "http://localhost:8000"
    const response = await fetch(`${apiUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    })

    // If the FastAPI request failed, return the error
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    // Return the prediction result
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in predict route:", error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 400 },
    )
  }
}
