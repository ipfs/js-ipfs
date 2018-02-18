#!/bin/sh
#
# Copyright (c) 2014 Christian Couder
# MIT Licensed; see the LICENSE file in this repository.
#

test_description="Test installation and some basic commands"

. lib/test-lib.sh

test_expect_success "current dir is writable" '
	echo "It works!" > test.txt
'

test_expect_success "ipfs version succeeds" '
	ipfs version > version.txt
'

test_expect_success "ipfs version shows js-ipfs" '
	grep "js-ipfs" version.txt > /dev/null ||
	test_fsh cat version.txt
'

test_expect_success "ipfs version output looks good" '
	egrep "^js-ipfs version: [0-9]+\.[0-9]+\.[0-9]" version.txt >/dev/null ||
	test_fsh cat version.txt
'

test_expect_success "ipfs version --all has all required fields" '
	ipfs version --all > version_all.txt &&
	grep "js-ipfs version" version_all.txt &&
  grep "Repo version" version_all.txt &&
	grep "System version" version_all.txt &&
	grep "Node.js version" version_all.txt
'

test_expect_success "ipfs help succeeds" '
	ipfs help > help.txt
'

# test_expect_success "ipfs help output looks good" '
# 	egrep -i "^Usage" help.txt > /dev/null &&
# 	egrep "ipfs .* <command>" help.txt >/dev/null ||
# 	test_fsh cat help.txt
# '

test_expect_success "'ipfs commands' succeeds" '
	ipfs commands > commands.txt
'

test_expect_success "'ipfs commands' output looks good" '
	grep "add" commands.txt &&
	grep "daemon" commands.txt &&
	grep "version" commands.txt
'

# test_expect_success "All commands accept --help" '
# 	while read -r cmd
# 	do
# 		echo "running: $cmd --help"
# 		$cmd --help </dev/null >/dev/null || return
# 	done <commands.txt
# '

# test_expect_success "'ipfs commands --flags' succeeds" '
# 	ipfs commands --flags >commands.txt
# '

# test_expect_success "'ipfs commands --flags' output looks good" '
# 	grep "ipfs pin add --recursive / ipfs pin add -r" commands.txt &&
# 	grep "ipfs id --format / ipfs id -f" commands.txt &&
# 	grep "ipfs repo gc --quiet / ipfs repo gc -q" commands.txt
# '

test_done
