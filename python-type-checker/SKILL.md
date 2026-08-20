---
name: python-type-checker
description: "Run static type checking on Python code using BasedPyright (a fork of Pyright with additional features). Use when the user needs to type-check Python files, find type errors, configure type checking strictness, or integrate type checking into a CI/CD workflow. Covers BasedPyright CLI usage, configuration via pyproject.toml, and common type error resolution patterns."
---

# Python Type Checker (DSH)

Run static type checking on Python code using BasedPyright through `pwsh`.

## Installation

```powershell
pip install basedpyright
# Or with pipx for isolated install
pipx install basedpyright
```

## Basic Usage

### Type-check a single file
```powershell
basedpyright my_module.py
```

### Type-check a directory/project
```powershell
basedpyright src/
```

### Type-check with specific configuration
```powershell
basedpyright --pythonversion 3.12 src/
```

### Output as JSON (for programmatic processing)
```powershell
basedpyright --outputjson src/
```

### Verbose output
```powershell
basedpyright --verbose src/
```

## Configuration

Create a `pyproject.toml` in the project root:

```toml
[tool.basedpyright]
pythonVersion = "3.12"
typeCheckingMode = "standard"  # "off", "basic", "standard", "strict", "all"
venvPath = "."
venv = ".venv"

# Diagnostic overrides
reportMissingImports = "error"
reportMissingTypeStubs = "warning"
reportUnknownParameterType = "error"
reportUnknownVariableType = "warning"
reportUnusedImport = "warning"

# Include/exclude paths
include = ["src/", "tests/"]
exclude = ["**/node_modules", "**/__pycache__", "**/.venv"]
```

## Modes

| Mode | Description |
|------|-------------|
| `off` | No type checking |
| `basic` | Basic type checking (no optional checks) |
| `standard` | Standard checks (recommended default) |
| `strict` | All standard + strict optional checks |
| `all` | Every available check enabled |

## Common Workflows

### Check specific file and read output
```powershell
basedpyright D:\Projects\src\main.py 2>&1
```

### Check entire project with JSON output for parsing
```powershell
basedpyright --outputjson D:\Projects\src 2>&1 | ConvertFrom-Json | Select-Object -ExpandProperty generalDiagnostics
```

### Run in background for large codebases
Use DSH's `subagent` or background `pwsh` for large projects.

## Fixing Common Errors

### Missing type stubs
```powershell
pip install types-requests  # for 'requests' stubs
```

### Unknown import
Add to configuration:
```toml
[tool.basedpyright]
ignore = ["**/some_problematic_dir"]
```

### Type ignore (last resort)
```python
x = some_function()  # type: ignore
```

## Integration with DSH Workflow

1. Write/edit Python code with `read`/`write`/`edit`
2. Run `basedpyright` via `pwsh` to check
3. Parse findings and fix issues
4. Repeat until clean

## Available DSH Tools

| Tool | Type Checking Use |
|------|-------------------|
| `pwsh` | Run BasedPyright CLI |
| `read` / `write` / `edit` | Read and fix Python files |
| `subagent` | Background type checking for large projects |
| `grep` | Find all `.py` files in project |
