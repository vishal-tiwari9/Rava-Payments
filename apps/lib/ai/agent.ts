import {ChatOpenAi} from "@langchain/openai";
import {AgentExecutor,createToolCallingAgent} from "langchain/agents";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {makepaymentTool} from "./tools/payment.tool";



export async function createPaymentAgent(agentId:string){

    // defining LLm

    const llm = new ChatOpenAi({
        modelName:"gpt-4o"
        temperature:0,
        openAIApiKey:process.env.OPENAI_API_KEY,
    });


//defining tool
    const tools =[
        makePaymentTool(agentId),
    ];



    // Agent prompt

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a helpful payment assistant.
     You help users make payments autonomously.
     Always confirm the merchant name and amount before paying.
     If a payment is blocked, explain why to the user clearly.`],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
    ]);



    const agent = createToolcallingAgent({llm,tools,prompt});



    ///Execution
    const executor = new AgentExecutor({
        agent, tools, verbose:true,
    });


    return executor;
}

export async function POST(req:Request){
    const {message,agentId} = await req.json();
    const agent = await createPaymentAgent(agentId);

    const result = await agent.invoke({input:message});

    return Response.json({response:result.output});
}