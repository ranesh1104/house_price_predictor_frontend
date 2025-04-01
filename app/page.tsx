"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Home,
  BedDouble,
  Bath,
  Building2,
  RouteIcon as Road,
  Users,
  Building,
  Thermometer,
  Wind,
  Car,
  Star,
  Sofa,
  Info,
  RotateCcw,
  History,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react"

// Define the form schema with validation
const formSchema = z.object({
  area: z.coerce.number().positive("Area must be positive"),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.coerce.number().min(0, "Bathrooms must be 0 or more"),
  stories: z.coerce.number().min(0, "Stories must be 0 or more"),
  mainroad: z.enum(["yes", "no"]),
  guestroom: z.enum(["yes", "no"]),
  basement: z.enum(["yes", "no"]),
  hotwaterheating: z.enum(["yes", "no"]),
  airconditioning: z.enum(["yes", "no"]),
  parking: z.coerce.number().int().min(0, "Parking must be 0 or more"),
  prefarea: z.enum(["yes", "no"]),
  furnishingstatus: z.enum(["furnished", "semi-furnished", "unfurnished"]),
})

type FormValues = z.infer<typeof formSchema>

// Sample presets for quick form filling
const presets = [
  {
    name: "Luxury Villa",
    values: {
      area: 3500,
      bedrooms: 5,
      bathrooms: 4.5,
      stories: 2,
      mainroad: "yes",
      guestroom: "yes",
      basement: "yes",
      hotwaterheating: "yes",
      airconditioning: "yes",
      parking: 3,
      prefarea: "yes",
      furnishingstatus: "furnished",
    },
  },
  {
    name: "Standard Apartment",
    values: {
      area: 1200,
      bedrooms: 2,
      bathrooms: 1,
      stories: 1,
      mainroad: "yes",
      guestroom: "no",
      basement: "no",
      hotwaterheating: "no",
      airconditioning: "yes",
      parking: 1,
      prefarea: "no",
      furnishingstatus: "semi-furnished",
    },
  },
  {
    name: "Budget Home",
    values: {
      area: 800,
      bedrooms: 1,
      bathrooms: 1,
      stories: 1,
      mainroad: "no",
      guestroom: "no",
      basement: "no",
      hotwaterheating: "no",
      airconditioning: "no",
      parking: 0,
      prefarea: "no",
      furnishingstatus: "unfurnished",
    },
  },
]

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function Page() {
  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Array<{ values: FormValues; result: number }>>([])
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("form")
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" | null }>({
    message: "",
    type: null,
  })
  const [copied, setCopied] = useState(false)

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: 1000,
      bedrooms: 2,
      bathrooms: 1,
      stories: 1,
      mainroad: "yes",
      guestroom: "no",
      basement: "no",
      hotwaterheating: "no",
      airconditioning: "no",
      parking: 1,
      prefarea: "no",
      furnishingstatus: "unfurnished",
    },
  })

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("prediction-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse history:", e)
      }
    }
  }, [])

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("prediction-history", JSON.stringify(history))
    }
  }, [history])

  // Simulate progress during API call
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      return () => {
        clearInterval(interval)
        setProgress(0)
      }
    }
  }, [loading])

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: null })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notification])

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [copied])

  const handleSubmit = async (values: FormValues) => {
    setLoading(true)
    setResult(null)
    setNotification({ message: "", type: null })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "API Error")
      }

      setResult(data.predicted_price)

      // Add to history
      setHistory((prev) => [{ values, result: data.predicted_price }, ...prev.slice(0, 9)])

      setNotification({
        message: `Prediction successful! The predicted price is ${formatCurrency(data.predicted_price)}`,
        type: "success",
      })

      // Switch to results tab
      setActiveTab("results")
    } catch (err: any) {
      setNotification({
        message: err.message || "Something went wrong",
        type: "error",
      })
    } finally {
      setLoading(false)
      setProgress(100)
      setTimeout(() => setProgress(0), 500)
    }
  }

  const applyPreset = (preset: (typeof presets)[0]) => {
    Object.entries(preset.values).forEach(([key, value]) => {
      form.setValue(key as keyof FormValues, value as any)
    })

    setNotification({
      message: `Applied the "${preset.name}" preset`,
      type: "info",
    })
  }

  const loadFromHistory = (item: (typeof history)[0]) => {
    Object.entries(item.values).forEach(([key, value]) => {
      form.setValue(key as keyof FormValues, value as any)
    })

    setNotification({
      message: "Previous values have been loaded",
      type: "info",
    })

    setActiveTab("form")
  }

  const resetForm = () => {
    form.reset()
    setNotification({
      message: "All fields have been reset to default values",
      type: "info",
    })
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(formatCurrency(result))
      setCopied(true)
      setNotification({
        message: "The predicted price has been copied to your clipboard",
        type: "success",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-t-4 border-t-green-600 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-green-700">
                <Home className="inline mr-2 mb-1" /> House Price Predictor
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Enter your property details to get an estimated price
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-green-50">
              AI Powered
            </Badge>
          </div>
        </CardHeader>

        {notification.type && (
          <div className="px-6">
            <Alert
              className={`mb-4 ${
                notification.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : notification.type === "error"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" && <CheckCircle2 className="h-4 w-4 mr-2" />}
                {notification.type === "error" && <AlertCircle className="h-4 w-4 mr-2" />}
                {notification.type === "info" && <Info className="h-4 w-4 mr-2" />}
                <AlertDescription>{notification.message}</AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="form">Property Details</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="form" className="pt-4">
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-1"
                  >
                    <Home className="h-4 w-4" />
                    {preset.name}
                  </Button>
                ))}
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Building2 className="mr-2 h-5 w-5 text-green-600" />
                      Basic Property Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Area (sq ft)
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Total area of the property in square feet</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <BedDouble className="h-4 w-4 mr-1 text-muted-foreground" />
                              Bedrooms
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
                              Bathrooms
                            </FormLabel>
                            <FormControl>
                              <Input type="number" step="0.5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                              Stories
                            </FormLabel>
                            <FormControl>
                              <Input type="number" step="0.5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Car className="h-4 w-4 mr-1 text-muted-foreground" />
                              Parking Spaces
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="furnishingstatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Sofa className="h-4 w-4 mr-1 text-muted-foreground" />
                              Furnishing Status
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="furnished">Furnished</SelectItem>
                                <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                                <SelectItem value="unfurnished">Unfurnished</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Star className="mr-2 h-5 w-5 text-green-600" />
                      Property Features
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="mainroad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Road className="h-4 w-4 mr-1 text-muted-foreground" />
                              Main Road Access
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guestroom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                              Guest Room
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="basement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                              Basement
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hotwaterheating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Thermometer className="h-4 w-4 mr-1 text-muted-foreground" />
                              Hot Water Heating
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="airconditioning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Wind className="h-4 w-4 mr-1 text-muted-foreground" />
                              Air Conditioning
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prefarea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-muted-foreground" />
                              Preferred Area
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Predicting...
                        </>
                      ) : (
                        <>
                          Predict Price
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="sm:flex-initial">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>

                  {loading && (
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center">Processing your request...</p>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </TabsContent>

          <TabsContent value="results">
            <CardContent className="pt-6">
              {result !== null ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium text-green-800 mb-2">Predicted House Price</h3>
                    <p className="text-4xl font-bold text-green-900 mb-2">{formatCurrency(result)}</p>
                    <p className="text-sm text-green-700">Based on the property details you provided</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Property Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Area</p>
                        <p className="font-medium">{form.getValues().area} sq ft</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Bedrooms</p>
                        <p className="font-medium">{form.getValues().bedrooms}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="font-medium">{form.getValues().bathrooms}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Furnishing</p>
                        <p className="font-medium capitalize">{form.getValues().furnishingstatus}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">
                          {form.getValues().prefarea === "yes" ? "Preferred Area" : "Standard Area"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500">Features</p>
                        <p className="font-medium">
                          {[
                            form.getValues().airconditioning === "yes" ? "AC" : null,
                            form.getValues().basement === "yes" ? "Basement" : null,
                            form.getValues().guestroom === "yes" ? "Guest Room" : null,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Basic"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setActiveTab("form")} variant="outline" className="flex-1">
                      Make Another Prediction
                    </Button>
                    <Button onClick={copyToClipboard} variant="secondary" className="flex-1">
                      {copied ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Result
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <Home className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No Prediction Yet</h3>
                  <p className="text-gray-500 mb-6">Fill out the property details form to get a price prediction</p>
                  <Button onClick={() => setActiveTab("form")}>Go to Form</Button>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="history">
            <CardContent className="pt-6">
              {history.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Previous Predictions</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHistory([])
                        localStorage.removeItem("prediction-history")
                        setNotification({
                          message: "Your prediction history has been cleared",
                          type: "info",
                        })
                      }}
                    >
                      Clear History
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-green-50">
                                {formatCurrency(item.result)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {item.values.bedrooms} bed, {item.values.bathrooms} bath
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {item.values.area} sq ft • {item.values.stories}{" "}
                              {item.values.stories === 1 ? "story" : "stories"} •
                              {item.values.furnishingstatus === "furnished"
                                ? " Furnished"
                                : item.values.furnishingstatus === "semi-furnished"
                                  ? " Semi-Furnished"
                                  : " Unfurnished"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => loadFromHistory(item)}>
                            <History className="mr-2 h-4 w-4" />
                            Load
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <History className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No History Yet</h3>
                  <p className="text-gray-500 mb-6">Your prediction history will appear here</p>
                  <Button onClick={() => setActiveTab("form")}>Make a Prediction</Button>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex flex-col items-start pt-0">
          <p className="text-xs text-gray-500 mt-4">
            This prediction is based on machine learning models and should be used as an estimate only. Actual property
            values may vary based on market conditions and other factors.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

