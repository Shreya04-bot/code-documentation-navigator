from typing import Dict, List


def _max_indent_depth(lines: List[str]) -> int:
    max_depth = 0
    for line in lines:
        stripped = line.lstrip()
        if not stripped or stripped.startswith(("#", "//")):
            continue
        leading = len(line) - len(stripped)
        depth = leading // 4 if "\t" not in line[:leading] else leading
        if depth > max_depth:
            max_depth = depth
    return max_depth


def _python_function_lengths(lines: List[str]) -> List[int]:
    lengths: List[int] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.lstrip()
        if stripped.startswith("def ") or stripped.startswith("async def "):
            base_indent = len(line) - len(stripped)
            j = i + 1
            while j < len(lines):
                next_line = lines[j]
                next_stripped = next_line.lstrip()
                if not next_stripped:
                    j += 1
                    continue
                next_indent = len(next_line) - len(next_stripped)
                if next_indent <= base_indent and (
                    next_stripped.startswith("def ")
                    or next_stripped.startswith("async def ")
                    or next_stripped.startswith("class ")
                ):
                    break
                j += 1
            lengths.append(max(j - i, 1))
            i = j
            continue
        i += 1
    return lengths


def _brace_function_lengths(lines: List[str]) -> List[int]:
    lengths: List[int] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        starts_function = (
            stripped.startswith("function ")
            or stripped.startswith("async function ")
            or ("=>" in stripped and "{" in stripped)
        )
        if starts_function and "{" in stripped:
            brace_count = stripped.count("{") - stripped.count("}")
            j = i + 1
            while j < len(lines) and brace_count > 0:
                brace_count += lines[j].count("{") - lines[j].count("}")
                j += 1
            lengths.append(max(j - i, 1))
            i = j
            continue
        i += 1
    return lengths


def analyze_code_risk(content: str, file_path: str) -> Dict:
    score = 1
    reasons = []
    lines = content.split("\n")

    # 1. File length
    if len(lines) > 500:
        score += 2
        reasons.append(f"File is very large ({len(lines)} lines)")
    elif len(lines) > 200:
        score += 1
        reasons.append(f"File is large ({len(lines)} lines)")

    # 2. Red flags
    red_flags = ["TODO", "FIXME", "HACK", "BUG", "DEPRECATED"]
    lowered = content.lower()
    for flag in red_flags:
        if flag.lower() in lowered:
            score += 1
            reasons.append(f"Contains {flag}")

    # 3. Nesting depth (approx)
    max_depth = _max_indent_depth(lines)
    if max_depth >= 6:
        score += 2
        reasons.append(f"High nesting depth (~{max_depth})")
    elif max_depth >= 4:
        score += 1
        reasons.append(f"Moderate nesting depth (~{max_depth})")

    # 4. Long functions (heuristics for Python + JS/TS)
    func_lengths = _python_function_lengths(lines) + _brace_function_lengths(lines)
    if func_lengths:
        longest = max(func_lengths)
        if longest >= 120:
            score += 2
            reasons.append(f"Very long function (~{longest} lines)")
        elif longest >= 60:
            score += 1
            reasons.append(f"Long function (~{longest} lines)")

    # Cap score
    score = min(score, 5)

    return {
        "score": score,
        "reason": ", ".join(reasons) if reasons else "No major risks detected"
    }
