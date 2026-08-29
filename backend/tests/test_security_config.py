import os
import stat
import sys
import tempfile
import unittest
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from hass_panel.utils.security import SECRET_ENV, resolve_jwt_secret


class JwtSecretTests(unittest.TestCase):
    def config(self, root):
        return {"base": {"user_config_dir": str(Path(root) / "user_configs")}}

    def test_environment_secret_wins_without_creating_a_file(self):
        with tempfile.TemporaryDirectory() as root:
            value = "environment-secret-with-at-least-32-characters"
            self.assertEqual(resolve_jwt_secret(self.config(root), {SECRET_ENV: value}), value)
            self.assertFalse((Path(root) / ".jwt_secret").exists())

    def test_generated_secret_is_persistent_and_private(self):
        with tempfile.TemporaryDirectory() as root:
            config = self.config(root)
            first = resolve_jwt_secret(config, {})
            second = resolve_jwt_secret(config, {})
            secret_file = Path(root) / ".jwt_secret"
            self.assertEqual(first, second)
            self.assertGreaterEqual(len(first), 32)
            if os.name != "nt":
                self.assertEqual(stat.S_IMODE(secret_file.stat().st_mode) & 0o077, 0)

    def test_short_environment_secret_is_rejected(self):
        with tempfile.TemporaryDirectory() as root:
            with self.assertRaises(RuntimeError):
                resolve_jwt_secret(self.config(root), {SECRET_ENV: "too-short"})


if __name__ == "__main__":
    unittest.main()
