#!/usr/bin/env python3
"""Optional single-RAF candidate from the unmodified owner HTML.

Canonical source and its four embedded PNGs remain byte-identical.
"""
import argparse
import hashlib
import re
from pathlib import Path

OWNER_SHA256 = 'd968e47997dbd1cf843fdc73fed94e682217e6d5c833a0c8d602ec5b064f94e5'
LEGACY_RAF = '(function D(){FC++;let A=performance.now();A-jC>1e3&&($0.push(FC*1e3/(A-jC)),FC=0,jC=A),requestAnimationFrame(D)})();'
GAME_RAF = 'function q0(D){let A=Math.min(.05,(D-E0)/1e3);'
SINGLE_RAF = ('function q0(D){FC++;if(D-jC>=1e3){$0.push(FC*1e3/(D-jC));'
              'if($0.length>180)$0.shift();FC=0;jC=D}'
              'let A=Math.min(.05,(D-E0)/1e3);')
PNG_RE = rb'"(assets/[^"\s]+\.png)":"data:image/png;base64,([A-Za-z0-9+/=]+)"'


def build(original: bytes) -> bytes:
    if hashlib.sha256(original).hexdigest() != OWNER_SHA256:
        raise ValueError('Owner source hash changed: refusing patch')
    before = dict(re.findall(PNG_RE, original))
    if len(before) != 4:
        raise ValueError('Embedded texture count changed')
    s = original.decode('utf-8')
    if s.count(LEGACY_RAF) != 1 or s.count(GAME_RAF) != 1:
        raise ValueError('RAF anchors do not match reviewed original')
    s = s.replace(LEGACY_RAF, '', 1).replace(GAME_RAF, SINGLE_RAF, 1)
    result = s.encode('utf-8')
    if dict(re.findall(PNG_RE, result)) != before:
        raise ValueError('Embedded textures changed')
    if result.count(b'requestAnimationFrame(q0)') != 2 or b'requestAnimationFrame(D)' in result:
        raise ValueError('Unexpected game RAF loop')
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    result = build(args.source.read_bytes())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(result)
    print('OWNER_SOURCE_SHA256:', OWNER_SHA256)
    print('OPTIONAL_BUILD_SHA256:', hashlib.sha256(result).hexdigest())
    print('ORIGINAL_UNCHANGED:', hashlib.sha256(args.source.read_bytes()).hexdigest() == OWNER_SHA256)


if __name__ == '__main__':
    main()
