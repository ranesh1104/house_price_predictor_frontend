import { z } from "zod"

// Define the API URL - can be overridden with environment variable
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Define the house data schema (matching the FastAPI model)
export const houseDataSchema = z.object({
  area: z.number().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  stories: z.number().min(0),
  mainroad: z.enum(["yes", "no"]),
  guestroom: z.enum(["yes", "no"]),
  basement: z.enum(["yes", "no"]),
  hotwaterheating: z.enum(["yes", "no"]),
  airconditioning: z.enum(["yes", "no"]),
  parking: z.number().int().min(0),
  prefarea: z.enum(["yes", "no"]),
  furnishingstatus: z.enum(["furnished", "semi-furnished", "unfurnished"]),
})

export type HouseData = z.infer<typeof houseDataSchema>

// Define the prediction response schema
export const predictionResponseSchema = z.object({
  predicted_price: z.number(),
})

export type PredictionResponse = z.infer<typeof predictionResponseSchema>

// Function to get a price prediction
export async function getPrediction(data: HouseData): Promise<PredictionResponse> {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || "Failed to get prediction")
  }

  return predictionResponseSchema.parse(await response.json())
}

