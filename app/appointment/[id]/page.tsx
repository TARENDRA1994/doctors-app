import AppointmentConfirmationClient from './client-page'

export default function AppointmentPage({ params }: { params: { id: string } }) {
    return <AppointmentConfirmationClient appointmentId={parseInt(params.id)} />
}
