import { prisma } from './prisma'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generatePrescriptionPDF(
    patientId: number, 
    doctorId: number, 
    filterActiveOnly: boolean = false
): Promise<{ buffer: Buffer; fileName: string }> {
    // Fetch Data
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId }
    }) as any

    const patient = await prisma.patient.findFirst({
        where: { id: patientId, doctorId }
    })

    if (!doctor || !patient) {
        throw new Error('Doctor or Patient not found')
    }

    // Fetch medicines
    let medicines = await prisma.medicine.findMany({
        where: { patientId, doctorId },
        orderBy: { createdAt: 'desc' },
        take: 30
    })

    // Filter if requested
    if (filterActiveOnly) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        medicines = medicines.filter(m => {
            const endDate = new Date(m.endDate)
            endDate.setHours(23, 59, 59, 999)
            return endDate >= today
        })
    }

    // Fetch Latest Vitals for Header
    const latestVitals = await prisma.vital.findMany({
        where: { patientId },
        orderBy: { timestamp: 'desc' },
        take: 20
    })

    // Filter for latest of each type
    const vitalMap = latestVitals.reduce((acc, v) => {
        if (!acc[v.type]) {
            acc[v.type] = `${v.value} ${v.unit}`
        }
        return acc
    }, {} as any)

    const weight = vitalMap['Weight'] || 'N/A'
    const bp = vitalMap['BP'] || 'N/A'
    const sugar = vitalMap['Blood Sugar'] || 'N/A'
    const height = vitalMap['Height'] || 'N/A'

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // --- Header (Clinic Branding & Doctor Details) ---
    if (doctor.selectedTemplate === 'TEMPLATE_2') {
        // Layout 2: Classic Professional (Left-Right Split)
        doc.setFontSize(22)
        doc.setTextColor(0)
        doc.setFont('helvetica', 'bold')
        doc.text(`DR. ${doctor.name.toUpperCase()}`, 15, 22)
        
        doc.setFontSize(10)
        doc.setTextColor(20, 184, 166) // medical-600
        doc.text(`${doctor.degree || ''} | ${doctor.specialization || ''}`, 15, 28)
        
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.setFont('helvetica', 'normal')
        doc.text(doctor.qualification || '', 15, 33)

        // Right side - Clinic Details
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.setFont('helvetica', 'bold')
        doc.text(doctor.clinicName.toUpperCase(), pageWidth - 15, 22, { align: 'right' })
        
        doc.setFontSize(9)
        doc.setTextColor(80)
        doc.setFont('helvetica', 'normal')
        doc.text(doctor.address || '', pageWidth - 15, 28, { align: 'right' })
        doc.text(`Contact: ${doctor.whatsappNumber} | ${doctor.website || ''}`, pageWidth - 15, 33, { align: 'right' })

        doc.setDrawColor(20, 184, 166)
        doc.setLineWidth(1.5)
        doc.line(15, 38, pageWidth - 15, 38)
    } else {
        // Layout 1: Modern Centered (Default)
        doc.setFontSize(26)
        doc.setTextColor(20, 184, 166) // medical-600 color
        doc.setFont('helvetica', 'bold')
        doc.text(doctor.clinicName.toUpperCase(), pageWidth / 2, 22, { align: 'center' })

        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text(`Dr. ${doctor.name}`, pageWidth / 2, 30, { align: 'center' })

        doc.setFontSize(10)
        doc.setTextColor(80)
        doc.setFont('helvetica', 'normal')
        doc.text(`${doctor.degree || ''} ${doctor.specialization || ''} | ${doctor.qualification || ''}`, pageWidth / 2, 36, { align: 'center' })
        doc.text(`${doctor.address || ''} | WhatsApp: ${doctor.whatsappNumber} | ${doctor.website || ''}`, pageWidth / 2, 42, { align: 'center' })

        doc.setDrawColor(20, 184, 166)
        doc.setLineWidth(1)
        doc.line(15, 48, pageWidth - 15, 48)
    }

    // --- Patient Demographics & Vitals Row ---
    doc.setFillColor(248, 250, 252) // gray-50
    doc.rect(15, 48, pageWidth - 30, 25, 'F')

    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text('PATIENT DETAILS', 20, 54)
    doc.text('CURRENT VITALS', pageWidth / 2 + 5, 54)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    doc.text(`Name: ${patient.name}`, 20, 60)
    doc.text(`Age/Sex: ${patient.age || 'N/A'} / ${patient.gender || 'N/A'}`, 20, 65)
    doc.text(`ID: P-${patient.id.toString().padStart(4, '0')}`, 20, 70)

    doc.text(`Weight: ${weight}`, pageWidth / 2 + 5, 60)
    doc.text(`BP: ${bp}`, pageWidth / 2 + 5, 65)
    doc.text(`Sugar: ${sugar}`, pageWidth / 2 + 5, 70)

    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 54, { align: 'right' })

    // --- Diagnosis ---
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text('Diagnosis / Clinical Notes:', 15, 85)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60)
    doc.text(patient.disease || 'General Observation', 15, 92)

    // --- Rx Section ---
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 184, 166)
    doc.text('Rx', 15, 105)

    const tableData = medicines.map(m => [
        m.name,
        `${m.dosage}`,
        `${m.frequency}x daily`,
        `${new Date(m.startDate).toLocaleDateString()} to ${new Date(m.endDate).toLocaleDateString()}`,
        m.instructions || '-'
    ])

    autoTable(doc, {
        startY: 110,
        head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [20, 184, 166],
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 10,
            textColor: 50
        },
        alternateRowStyles: {
            fillColor: [245, 255, 254]
        },
        margin: { left: 15, right: 15 }
    })

    // --- Footer ---
    const finalY = (doc as any).lastAutoTable.finalY + 25
    doc.setFontSize(11)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text('Digital Signature', pageWidth - 15, finalY, { align: 'right' })

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'italic')
    doc.text('(This is a system-generated secure digital prescription)', pageWidth - 15, finalY + 6, { align: 'right' })

    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated via SanjeevaniBharat AI - ${doctor.clinicName}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })

    // Output as Buffer
    const pdfOutput = doc.output('arraybuffer')
    const buffer = Buffer.from(pdfOutput)

    return { buffer, fileName: `Prescription_${patient.name}.pdf` }
}
