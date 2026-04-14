import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface PatientData {
    name: string
    age: number | null
    gender?: string
    weight: number | null
    height: number | null
    disease: string | null
    medicines: { name: string; dosage: string; frequency: number }[]
    foodPreference: string | null
    allergies: string | null
    activityLevel: string | null
    preferredLanguage?: string
    doctorNotes?: string
}

export async function generateDietPlan(patientData: PatientData): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const bmi = patientData.weight && patientData.height
        ? (patientData.weight / Math.pow(patientData.height / 100, 2)).toFixed(1)
        : 'Not available'

    const medicineList = patientData.medicines.length > 0
        ? patientData.medicines.map(m => `- ${m.name} (${m.dosage}, ${m.frequency}x/day)`).join('\n')
        : 'No current medications'

    const language = patientData.preferredLanguage || 'English'

    const prompt = `You are an AI Clinical Nutrition Assistant. Generate a highly concise diet plan in ${language} language for:
- Patient: ${patientData.name} (${patientData.age}y, ${patientData.gender})
- BMI: ${bmi}
- Conditions: ${patientData.disease || 'None'}
- Meds: ${medicineList}

CRITICAL:
1. THE ENTIRE RESPONSE MUST BE IN ${language} LANGUAGE.
2. The entire response must be UNDER 1800 characters to fit in ONE WhatsApp message.

FORMAT:
## 🩺 Health Assessment
(2 sentences max)

## ⚠️ Avoid
(Bullet points)

## ✅ Include
(Bullet points)

## 🥣 Daily Meal Plan
(Ultra-concise: Breakfast, Lunch, Tea, Dinner)

Keep it practical and very short.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
}

/**
 * AI Lab Report Summarizer
 * Analyzes image/PDF data and returns a concise summary
 */
export async function analyzeLabReport(fileBase64: string, mimeType: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a Clinical Lab Assistant. 
    Analyze this lab report and provide a highly concise medical summary.
    
    FOCUS ON:
    1. Abnormal values (High/Low).
    2. Critical markers that a doctor should notice immediately.
    3. A 1-sentence conclusion.
    
    KEEP IT CONCISE: Max 150 words.
    Use professional tone.`

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: fileBase64,
                mimeType: mimeType
            }
        }
    ])

    const response = await result.response
    return response.text()
}
