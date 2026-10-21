"""Unit tests for the static n8n JSON validator."""
import json
import tempfile
import unittest
from pathlib import Path

from scripts.validate_workflow_exports_strict import validate


class ValidateWorkflowExportsTests(unittest.TestCase):
    def write_json(self, folder: Path, payload) -> Path:
        path = folder / "workflow.json"
        path.write_text(json.dumps(payload), encoding="utf-8")
        return path

    def test_valid_minimal_graph_passes(self):
        with tempfile.TemporaryDirectory() as temp:
            path = self.write_json(Path(temp), {
                "nodes": [
                    {"id": "a", "name": "Start", "type": "n8n-nodes-base.manualTrigger"},
                    {"id": "b", "name": "Finish", "type": "n8n-nodes-base.noOp"},
                ],
                "connections": {
                    "Start": {"main": [[{"node": "Finish", "type": "main", "index": 0}]]}
                },
            })
            self.assertEqual(validate(path), [])

    def test_invalid_json_is_reported(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "workflow.json"
            path.write_text("{not json", encoding="utf-8")
            self.assertTrue(any("cannot read valid UTF-8 JSON" in issue for issue in validate(path)))

    def test_missing_connection_target_is_reported(self):
        with tempfile.TemporaryDirectory() as temp:
            path = self.write_json(Path(temp), {
                "nodes": [{"id": "a", "name": "Start", "type": "n8n-nodes-base.manualTrigger"}],
                "connections": {
                    "Start": {"main": [[{"node": "Missing", "type": "main", "index": 0}]]}
                },
            })
            self.assertTrue(any("connects to missing node 'Missing'" in issue for issue in validate(path)))

    def test_duplicate_node_names_are_reported(self):
        with tempfile.TemporaryDirectory() as temp:
            path = self.write_json(Path(temp), {
                "nodes": [
                    {"id": "a", "name": "Same", "type": "example.one"},
                    {"id": "b", "name": "Same", "type": "example.two"},
                ],
                "connections": {},
            })
            self.assertTrue(any("duplicates node name 'Same'" in issue for issue in validate(path)))


if __name__ == "__main__":
    unittest.main()
