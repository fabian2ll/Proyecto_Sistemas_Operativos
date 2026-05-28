import urllib.request
import json

def post(url, data):
    req = urllib.request.Request(
        url, json.dumps(data).encode(),
        {'Content-Type': 'application/json'}, method='POST'
    )
    r = urllib.request.urlopen(req)
    return json.loads(r.read())

def get(url):
    return json.loads(urllib.request.urlopen(url).read())

BASE = 'http://localhost:5000/api'

# Setup
r = post(BASE + '/simulation/setup', {'num_processes': 6, 'quantum': 3, 'total_frames': 8})
print('Setup processes:', len(r['processes']))

# Run RR
r = post(BASE + '/simulation/run', {'algorithm': 'RR'})
print('RR gantt entries:', len(r['gantt_chart']))
print('avg_waiting:', r['averages']['avg_waiting'])
print('page_faults:', r['memory_state']['page_faults'])
print('file accesses:', r['file_log']['total_accesses'])
print('file conflicts:', r['file_log']['conflict_count'])

# Examples
ex = get(BASE + '/simulation/examples')
print('Examples:', len(ex['examples']))

# Reset
post(BASE + '/simulation/reset', {})
print('Reset OK')

print('ALL API TESTS PASSED')
