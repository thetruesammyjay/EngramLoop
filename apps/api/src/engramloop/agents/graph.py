from typing import Any

from langgraph.graph import END, START, StateGraph
from sqlalchemy.ext.asyncio import AsyncSession

from engramloop.agents.nodes.respond import respond
from engramloop.agents.nodes.retrieve import make_retrieve_node
from engramloop.agents.state import AgentState


def build_agent(session: AsyncSession) -> Any:
    workflow = StateGraph(AgentState)
    workflow.add_node("retrieve", make_retrieve_node(session))
    workflow.add_node("respond", respond)
    workflow.add_edge(START, "retrieve")
    workflow.add_edge("retrieve", "respond")
    workflow.add_edge("respond", END)
    return workflow.compile()

