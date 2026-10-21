"""Release-only human approval gate tied to exact production manifests."""
import argparse
import hashlib
import json
from pathlib import Path

def verify(approval_path, asset_manifest, reference_manifest):
    approval_path=Path(approval_path)
    if not approval_path.is_file():
        return {"status":"FAIL","reason":"owner_approval_missing"}
    try:
        record=json.loads(approval_path.read_text(encoding="utf-8"))
        if not isinstance(record,dict) or record.get("approved") is not True:
            return {"status":"FAIL","reason":"owner_approval_not_granted"}
        for key,path in (("asset_manifest_sha256",asset_manifest),("reference_manifest_sha256",reference_manifest)):
            expected=hashlib.sha256(Path(path).read_bytes()).hexdigest()
            if record.get(key)!=expected:
                return {"status":"FAIL","reason":"approval_digest_mismatch","field":key}
        if not isinstance(record.get("reviewer"),str) or not record["reviewer"].strip():
            return {"status":"FAIL","reason":"reviewer_missing"}
        return {"status":"PASS","reviewer":record["reviewer"]}
    except (OSError,ValueError,TypeError) as error:
        return {"status":"FAIL","reason":"invalid_approval","detail":str(error)}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--approval",required=True)
    p.add_argument("--asset-manifest",required=True)
    p.add_argument("--reference-manifest",required=True)
    p.add_argument("--output")
    a=p.parse_args()
    result=verify(a.approval,a.asset_manifest,a.reference_manifest)
    rendered=json.dumps(result,indent=2)
    if a.output:Path(a.output).write_text(rendered,encoding="utf-8")
    print(rendered)
    raise SystemExit(result["status"]!="PASS")
