#!/bin/sh
#
# Copyright (c) 2014 Christian Couder
# MIT Licensed; see the LICENSE file in this repository.
#

test_description="Stress test Garbage Collection"

. lib/test-lib.sh

test_expect_success "Can add and then GC filesets" '
	export FILE_COUNT=3
	export FILE_SIZE_MB=1
	for (( i=1; i <= FILE_COUNT; i++ )); do dd if=/dev/urandom bs=$((FILE_SIZE_MB * 1048576)) count=1 of=file$i; done
	export IPFS_PATH="$(pwd)/.ipfs" &&
	echo "IPFS_PATH: \"$IPFS_PATH\"" &&
	BITS="2048" &&
	ipfs init --bits="$BITS" >actual_init ||
	test_fsh cat actual_init
	for (( i=1; i <= FILE_COUNT; i++ )); do ipfs add --pin=false --quiet file$i > hash$i; done
	time ipfs repo gc
	ipfs refs local > local-refs
	for (( i=1; i <= FILE_COUNT; i++ )); do test_expect_code 1 grep `cat hash$i` local-refs; done	
'

test_done
