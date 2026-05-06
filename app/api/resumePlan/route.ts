export async function POST(request: Request) {
    const body = await request.json();
    const { threadId, decision, feedback } = body;
    
    console.log("Resume Plan - Thread ID:", threadId, "Decision:", decision);
    
    if (!threadId || !decision) {
        return new Response(
            JSON.stringify({ error: "threadId and decision are required" }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            }
        );
    }

    if (decision === 'no' && !feedback) {
        return new Response(
            JSON.stringify({ error: "feedback is required when decision is 'no'" }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            }
        );
    }

    const response = await fetch(
        `${process.env.AGENT_URL}/api/recipe-plan/resume/${threadId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                decision: decision,
                feedback: feedback || undefined
            }),
        },
    );

    if (!response.ok) {
        return new Response(
            JSON.stringify({ error: "Failed to resume plan" }),
            {
                status: response.status,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            }
        );
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}