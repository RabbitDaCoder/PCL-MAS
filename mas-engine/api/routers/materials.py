# Extracts a single uploaded material's PDF text right after upload — the Node backend caches
# the result on the Material document so later pre-test generation can reuse it instead of
# re-downloading/re-parsing the same file every time.
from fastapi import APIRouter
from pydantic import BaseModel

from tools.pdf_extractor import extract_text_from_pdf_url

router = APIRouter(tags=["materials"])


class ExtractMaterialPayload(BaseModel):
    materialUrl: str


class ExtractMaterialResponse(BaseModel):
    extractedText: str


@router.post("/extract-material", response_model=ExtractMaterialResponse)
def post_extract_material(payload: ExtractMaterialPayload) -> ExtractMaterialResponse:
    text = extract_text_from_pdf_url(payload.materialUrl)
    return ExtractMaterialResponse(extractedText=text)
