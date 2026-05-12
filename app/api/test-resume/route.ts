export async function POST(request: Request) {
    return new Response(JSON.stringify({ message: "test works" }), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
