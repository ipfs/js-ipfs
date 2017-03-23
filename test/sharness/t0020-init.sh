#!/bin/sh
#
# Copyright (c) 2014 Christian Couder
# MIT Licensed; see the LICENSE file in this repository.
#

test_description="Test init command"

. lib/test-lib.sh

# test that ipfs fails to init if IPFS_PATH isnt writeable
test_expect_success "create dir and change perms succeeds" '
	export IPFS_PATH="$(pwd)/.badipfs" &&
	mkdir "$IPFS_PATH" &&
	chmod 000 "$IPFS_PATH"
'

test_expect_success "ipfs init fails" '
	test_must_fail ipfs init 2> init_fail_out
'

# Under Windows/Cygwin the error message is different,
# so we use the STD_ERR_MSG prereq.
if test_have_prereq STD_ERR_MSG; then
	init_err_msg="Error: failed to take lock at $IPFS_PATH: permission denied"
else
	init_err_msg="Error: mkdir $IPFS_PATH: The system cannot find the path specified."
fi

init_js_err_msg="Error: EACCES: permission denied, stat '$IPFS_PATH/version'"

# test_expect_success "ipfs init output looks good" '
# 	echo "$init_js_err_msg" > init_fail_exp &&
# 	test_cmp init_fail_exp init_fail_out
# '

test_expect_success "cleanup dir with bad perms" '
	chmod 775 "$IPFS_PATH" &&
	rmdir "$IPFS_PATH"
'

# test no repo error message
# this applies to `ipfs add sth`, `ipfs refs <hash>`
test_expect_success "ipfs cat fails" '
    export IPFS_PATH="$(pwd)/.ipfs" &&
    test_must_fail ipfs cat Qmaa4Rw81a3a1VEx4LxB7HADUAXvZFhCoRdBzsMZyZmqHD 2> cat_fail_out
'

test_done
