import re

with open('src/b2b/mock/channelDrilldown.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r"(blinkit:\s*\{.*?receivedAmount:\s*)32_00_000(,\s*pendingBalance:\s*)3_80_000",
    r"\g<1>33_32_000\g<2>2_48_000",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"issueFlags:\s*\[\s*\{\s*type:\s*'Debit note – damages',\s*count:\s*2,\s*amount:\s*1_52_000\s*\},\s*\{\s*type:\s*'Pending GRN',\s*count:\s*1,\s*amount:\s*96_000\s*\},\s*\{\s*type:\s*'Rate variance',\s*count:\s*1,\s*amount:\s*38_000\s*\}\s*\]",
    """issueFlags: [
      { type: 'Debit note – damages', count: 1, amount: 1_52_000 },
      { type: 'Pending GRN', count: 1, amount: 96_000 },
    ]""",
    content
)

content = re.sub(
    r"(zepto:\s*\{.*?receivedAmount:\s*)28_00_000(,\s*pendingBalance:\s*)3_20_000",
    r"\g<1>31_20_000\g<2>0",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"(zepto:\s*\{.*?)\s*issueFlags:\s*\[.*?\]",
    r"\g<1>\n    issueFlags: []",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"(reliance:\s*\{.*?receivedAmount:\s*)18_00_000(,\s*pendingBalance:\s*)1_80_000",
    r"\g<1>19_80_000\g<2>0",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"(reliance:\s*\{.*?)\s*issueFlags:\s*\[.*?\]",
    r"\g<1>\n    issueFlags: []",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"('cafes-bangalore':\s*\{.*?receivedAmount:\s*)12_00_000(,\s*pendingBalance:\s*)1_20_000",
    r"\g<1>13_20_000\g<2>0",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"('cafes-bangalore':\s*\{.*?)\s*issueFlags:\s*\[.*?\]",
    r"\g<1>\n    issueFlags: []",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"accounts:\s*\[\s*\{ name: 'Third Wave Coffee - Koramangala', salesInPeriod: 2_40_000, receivedAmount: 1_92_000, pendingBalance: 48_000, status: 'Overdue' \},\s*\{ name: 'Starbucks - Indiranagar', salesInPeriod: 3_10_000, receivedAmount: 3_10_000, pendingBalance: 0, status: 'Settled' \},\s*\{ name: 'Paper and Pie - Whitefield', salesInPeriod: 1_80_000, receivedAmount: 1_50_000, pendingBalance: 30_000, status: 'Partial' \},\s*\{ name: 'Blue Tokai - Jayanagar', salesInPeriod: 2_20_000, receivedAmount: 2_20_000, pendingBalance: 0, status: 'Settled' \},\s*\{ name: 'Hatti Kaapi - MG Road', salesInPeriod: 1_50_000, receivedAmount: 1_08_000, pendingBalance: 42_000, status: 'Overdue' \}\s*\]",
    """accounts: [
      { name: 'Third Wave Coffee - Koramangala', salesInPeriod: 2_40_000, receivedAmount: 2_40_000, pendingBalance: 0, status: 'Settled' },
      { name: 'Starbucks - Indiranagar', salesInPeriod: 3_10_000, receivedAmount: 3_10_000, pendingBalance: 0, status: 'Settled' },
      { name: 'Paper and Pie - Whitefield', salesInPeriod: 1_80_000, receivedAmount: 1_80_000, pendingBalance: 0, status: 'Settled' },
      { name: 'Blue Tokai - Jayanagar', salesInPeriod: 2_20_000, receivedAmount: 2_20_000, pendingBalance: 0, status: 'Settled' },
      { name: 'Hatti Kaapi - MG Road', salesInPeriod: 1_50_000, receivedAmount: 1_50_000, pendingBalance: 0, status: 'Settled' }
    ]""",
    content,
    flags=re.DOTALL
)

with open('src/b2b/mock/channelDrilldown.ts', 'w') as f:
    f.write(content)
