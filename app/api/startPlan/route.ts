export async function POST(request: Request) {
    const body = await request.json();
    console.log("Body:", body, process.env.AGENT_URL);
    const response = await fetch(
        `${process.env.AGENT_URL}/api/recipe-plan/start`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        },
    );

    const result = await response.json();

    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}