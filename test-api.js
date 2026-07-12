async function main() {
    const loginRes = await fetch('https://deepskyblue-gerbil-405007.hostingersite.com/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            email: 'tarendra.garhewal2024@gmail.com',
            password: 'Tarendra123DoctorsApp99', // Or whatever the doctor's password is... wait, I don't know the user's password for the app!
        })
    });
}
main();
