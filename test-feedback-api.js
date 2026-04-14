async function testUrl() {
    const resp = await fetch('http://localhost:3001/api/feedback?doctorId=1')
    const json = await resp.json()
    console.log(JSON.stringify(json, null, 2))
}
testUrl()
