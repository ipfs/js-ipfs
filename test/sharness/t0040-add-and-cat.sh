#!/bin/sh
#
# Copyright (c) 2014 Christian Couder
# MIT Licensed; see the LICENSE file in this repository.
#

test_description="Test add and cat commands"

. lib/test-lib.sh

test_add_cat_file() {
	test_expect_success "ipfs add --help works" '
		ipfs add --help 2> add_help_err > /dev/null
	'

	test_expect_success "stdin reading message doesnt show up" '
		test_expect_code 1 grep "ipfs: Reading from" add_help_err &&
		test_expect_code 1 grep "send Ctrl-d to stop." add_help_err
	'

    test_expect_success "ipfs add succeeds" '
    	echo "Hello Worlds!" >mountdir/hello.txt &&
        ipfs add mountdir/hello.txt >actual
    '

    test_expect_success "ipfs add output looks good" '
    	HASH="QmVr26fY1tKyspEJBniVhqxQeEjhF78XerGiqWAwraVLQH" &&
        echo "added $HASH hello.txt" >expected &&
    	test_cmp expected actual
    '

    test_expect_success "ipfs add --only-hash succeeds" '
    	ipfs add --only-hash mountdir/hello.txt > oh_actual
    '

    test_expect_success "ipfs add --only-hash output looks good" '
        test_cmp expected oh_actual
    '

    test_expect_success "ipfs cat succeeds" '
    	ipfs cat "$HASH" >actual
    '

    test_expect_success "ipfs cat output looks good" '
    	echo "Hello Worlds!" >expected &&
    	test_cmp expected actual
    '

    test_expect_success "ipfs cat /ipfs/file succeeds" '
    	ipfs cat /ipfs/$HASH >actual
    '

    test_expect_success "output looks good" '
    	test_cmp expected actual
    '

    test_expect_success "ipfs add -t succeeds" '
        ipfs add -t mountdir/hello.txt >actual
    '

    test_expect_success "ipfs add -t output looks good" '
    	HASH="QmUkUQgxXeggyaD5Ckv8ZqfW8wHBX6cYyeiyqvVZYzq5Bi" &&
        echo "added $HASH hello.txt" >expected &&
        test_cmp expected actual
    '

    test_expect_success "ipfs add --chunker size-32 succeeds" '
        ipfs add --chunker rabin mountdir/hello.txt >actual
    '

    test_expect_success "ipfs add --chunker size-32 output looks good" '
    	HASH="QmVr26fY1tKyspEJBniVhqxQeEjhF78XerGiqWAwraVLQH" &&
        echo "added $HASH hello.txt" >expected &&
        test_cmp expected actual
    '

    test_expect_success "ipfs add on hidden file succeeds" '
        echo "Hello Worlds!" >mountdir/.hello.txt &&
        ipfs add mountdir/.hello.txt >actual
    '

    test_expect_success "ipfs add on hidden file output looks good" '
        HASH="QmVr26fY1tKyspEJBniVhqxQeEjhF78XerGiqWAwraVLQH" &&
        echo "added $HASH .hello.txt" >expected &&
        test_cmp expected actual
    '
}

test_add_cat_5MB() {
    test_expect_success "generate 5MB file using go-random" '
    	random 5242880 41 >mountdir/bigfile
    '

    test_expect_success "sha1 of the file looks ok" '
    	echo "11145620fb92eb5a49c9986b5c6844efda37e471660e" >sha1_expected &&
    	multihash -a=sha1 -e=hex mountdir/bigfile >sha1_actual &&
    	test_cmp sha1_expected sha1_actual
    '

    test_expect_success "'ipfs add bigfile' succeeds" '
    	ipfs add mountdir/bigfile >actual ||
		test_fsh cat daemon_err
    '

    test_expect_success "'ipfs add bigfile' output looks good" '
    	HASH="QmSr7FqYkxYWGoSfy8ZiaMWQ5vosb18DQGCzjwEQnVHkTb" &&
    	echo "added $HASH bigfile" >expected &&
    	test_cmp expected actual
    '
    test_expect_success "'ipfs cat' succeeds" '
    	ipfs cat "$HASH" >actual
    '

    test_expect_success "'ipfs cat' output looks good" '
    	test_cmp mountdir/bigfile actual
    '

    test_expect_success FUSE "cat ipfs/bigfile succeeds" '
    	cat "ipfs/$HASH" >actual
    '

    test_expect_success FUSE "cat ipfs/bigfile looks good" '
    	test_cmp mountdir/bigfile actual
    '
}

test_add_cat_expensive() {
    test_expect_success EXPENSIVE "generate 100MB file using go-random" '
    	random 104857600 42 >mountdir/bigfile
    '

    test_expect_success EXPENSIVE "sha1 of the file looks ok" '
    	echo "1114885b197b01e0f7ff584458dc236cb9477d2e736d" >sha1_expected &&
    	multihash -a=sha1 -e=hex mountdir/bigfile >sha1_actual &&
    	test_cmp sha1_expected sha1_actual
    '

    test_expect_success EXPENSIVE "ipfs add bigfile succeeds" '
    	ipfs add mountdir/bigfile >actual
    '

    test_expect_success EXPENSIVE "ipfs add bigfile output looks good" '
    	HASH="QmU9SWAPPmNEKZB8umYMmjYvN7VyHqABNvdA6GUi4MMEz3" &&
    	echo "added $HASH bigfile" >expected &&
    	test_cmp expected actual
    '

    test_expect_success EXPENSIVE "ipfs cat succeeds" '
    	ipfs cat "$HASH" | multihash -a=sha1 -e=hex >sha1_actual
    '

    test_expect_success EXPENSIVE "ipfs cat output looks good" '
    	ipfs cat "$HASH" >actual &&
    	test_cmp mountdir/bigfile actual
    '

    test_expect_success EXPENSIVE "ipfs cat output hashed looks good" '
    	echo "1114885b197b01e0f7ff584458dc236cb9477d2e736d" >sha1_expected &&
    	test_cmp sha1_expected sha1_actual
    '

    test_expect_success FUSE,EXPENSIVE "cat ipfs/bigfile succeeds" '
    	cat "ipfs/$HASH" | multihash -a=sha1 -e=hex >sha1_actual
    '

    test_expect_success FUSE,EXPENSIVE "cat ipfs/bigfile looks good" '
    	test_cmp sha1_expected sha1_actual
    '
}

test_add_named_pipe() {
    err_prefix=$1
    test_expect_success "useful error message when adding a named pipe" '
        mkfifo named-pipe &&
	    test_expect_code 1 ipfs add named-pipe 2>actual &&
        rm named-pipe &&
        grep "Error: Unrecognized file type for named-pipe: $(generic_stat named-pipe)" actual &&
        grep USAGE actual &&
        grep "ipfs add" actual
    '

    test_expect_success "useful error message when recursively adding a named pipe" '
    	mkdir -p named-pipe-dir &&
    	mkfifo named-pipe-dir/named-pipe &&
    	test_expect_code 1 ipfs add -r named-pipe-dir 2>actual &&
        printf "Error:$err_prefix Unrecognized file type for named-pipe-dir/named-pipe: $(generic_stat named-pipe-dir/named-pipe)\n" >expected &&
        rm named-pipe-dir/named-pipe &&
        rmdir named-pipe-dir &&
    	test_cmp expected actual
    '
}

test_add_pwd_is_symlink() {
    test_expect_success "ipfs add -r adds directory content when ./ is symlink" '
      mkdir hellodir &&
      echo "World" > hellodir/world &&
      ln -s hellodir hellolink &&
      ( cd hellolink &&
        ipfs add -r . > ../actual ) &&
      grep "added Qma9CyFdG5ffrZCcYSin2uAETygB25cswVwEYYzwfQuhTe" actual &&
      rm -r hellodir
    '
}

test_launch_ipfs_daemon_and_mount

test_expect_success "'ipfs add --help' succeeds" '
	ipfs add --help >actual
'

test_expect_success "'ipfs add --help' output looks good" '
	egrep "ipfs add.*<path>" actual >/dev/null ||
	test_fsh cat actual
'

test_expect_success "'ipfs cat --help' succeeds" '
	ipfs cat --help >actual
'

test_expect_success "'ipfs cat --help' output looks good" '
	egrep "ipfs cat.*<ipfs-path>" actual >/dev/null ||
	test_fsh cat actual
'

test_add_cat_file

test_expect_success "ipfs cat succeeds with stdin opened (issue #1141)" '
	cat mountdir/hello.txt | while read line; do ipfs cat "$HASH" >actual || exit; done
'

test_expect_success "ipfs cat output looks good" '
    cat mountdir/hello.txt >expected &&
	test_cmp expected actual
'

test_expect_success "ipfs cat accept hash from built input" '
	echo "$HASH" | ipfs cat >actual
'

test_expect_success "ipfs cat output looks good" '
	test_cmp expected actual
'

test_expect_success FUSE "cat ipfs/stuff succeeds" '
	cat "ipfs/$HASH" >actual
'

test_expect_success FUSE "cat ipfs/stuff looks good" '
	test_cmp expected actual
'

test_expect_success "'ipfs add -q' succeeds" '
	echo "Hello Venus!" >mountdir/venus.txt &&
	ipfs add -q mountdir/venus.txt >actual
'

test_expect_success "'ipfs add -q' output looks good" '
	HASH="QmU5kp3BH3B8tnWUU2Pikdb2maksBNkb92FHRr56hyghh4" &&
	echo "$HASH" >expected &&
	test_cmp expected actual
'

test_expect_success "'ipfs add -q' with stdin input succeeds" '
	echo "Hello Jupiter!" | ipfs add -q >actual
'

test_expect_success "'ipfs add -q' output looks good" '
	HASH="QmUnvPcBctVTAcJpigv6KMqDvmDewksPWrNVoy1E1WP5fh" &&
	echo "$HASH" >expected &&
	test_cmp expected actual
'

test_expect_success "'ipfs cat' succeeds" '
	ipfs cat "$HASH" >actual
'

test_expect_success "ipfs cat output looks good" '
	echo "Hello Jupiter!" >expected &&
	test_cmp expected actual
'

test_expect_success "'ipfs add' with stdin input succeeds" '
	printf "Hello Neptune!\nHello Pluton!" | ipfs add >actual
'

test_expect_success "'ipfs add' output looks good" '
	HASH="QmZDhWpi8NvKrekaYYhxKCdNVGWsFFe1CREnAjP1QbPaB3" &&
	echo "added $HASH $HASH" >expected &&
	test_cmp expected actual
'

test_expect_success "'ipfs cat' with built input succeeds" '
	echo "$HASH" | ipfs cat >actual
'

test_expect_success "ipfs cat with built input output looks good" '
	printf "Hello Neptune!\nHello Pluton!" >expected &&
	test_cmp expected actual
'

test_expect_success "'ipfs add -r' succeeds" '
	mkdir mountdir/planets &&
	echo "Hello Mars!" >mountdir/planets/mars.txt &&
	echo "Hello Venus!" >mountdir/planets/venus.txt &&
	ipfs add -r mountdir/planets >actual
'

test_expect_success "'ipfs add -r' output looks good" '
	PLANETS="QmWSgS32xQEcXMeqd3YPJLrNBLSdsfYCep2U7CFkyrjXwY" &&
	MARS="QmPrrHqJzto9m7SyiRzarwkqPcCSsKR2EB1AyqJfe8L8tN" &&
	VENUS="QmU5kp3BH3B8tnWUU2Pikdb2maksBNkb92FHRr56hyghh4" &&
	echo "added $MARS planets/mars.txt" >expected &&
	echo "added $VENUS planets/venus.txt" >>expected &&
	echo "added $PLANETS planets" >>expected &&
	test_cmp expected actual
'

test_expect_success "'ipfs add -rn' succeeds" '
	mkdir -p mountdir/moons/jupiter &&
	mkdir -p mountdir/moons/saturn &&
	echo "Hello Europa!" >mountdir/moons/jupiter/europa.txt &&
	echo "Hello Titan!" >mountdir/moons/saturn/titan.txt &&
	echo "hey youre no moon!" >mountdir/moons/mercury.txt &&
	ipfs add -rn mountdir/moons >actual
'

test_expect_success "'ipfs add -rn' output looks good" '
	MOONS="QmVKvomp91nMih5j6hYBA8KjbiaYvEetU2Q7KvtZkLe9nQ" &&
	EUROPA="Qmbjg7zWdqdMaK2BucPncJQDxiALExph5k3NkQv5RHpccu" &&
  JUPITER="QmS5mZddhFPLWFX3w6FzAy9QxyYkaxvUpsWCtZ3r7jub9J" &&
  SATURN="QmaMagZT4rTE7Nonw8KGSK4oe1bh533yhZrCo1HihSG8FK" &&
	TITAN="QmZzppb9WHn552rmRqpPfgU5FEiHH6gDwi3MrB9cTdPwdb" &&
	MERCURY="QmUJjVtnN8YEeYcS8VmUeWffTWhnMQAkk5DzZdKnPhqUdK" &&
  echo "added $EUROPA moons/jupiter/europa.txt" >expected &&
  echo "added $MERCURY moons/mercury.txt" >>expected &&
  echo "added $TITAN moons/saturn/titan.txt" >>expected &&
  echo "added $JUPITER moons/jupiter" >>expected &&
  echo "added $SATURN moons/saturn" >>expected &&
  echo "added $MOONS moons" >>expected &&
	test_cmp expected actual
'

test_expect_success "ipfs cat accept many hashes from built input" '
	{ echo "$MARS"; echo "$VENUS"; } | ipfs cat >actual
'

test_expect_success "ipfs cat output looks good" '
	cat mountdir/planets/mars.txt mountdir/planets/venus.txt >expected &&
	test_cmp expected actual
'

test_expect_success "ipfs cat accept many hashes as args" '
	ipfs cat "$MARS" "$VENUS" >actual
'

test_expect_success "ipfs cat output looks good" '
	test_cmp expected actual
'

test_expect_success "ipfs cat with both arg and stdin" '
	echo "$MARS" | ipfs cat "$VENUS" >actual
'

test_expect_success "ipfs cat output looks good" '
	cat mountdir/planets/venus.txt >expected &&
	test_cmp expected actual
'

test_expect_success "ipfs cat with two args and stdin" '
	echo "$MARS" | ipfs cat "$VENUS" "$VENUS" >actual
'

test_expect_success "ipfs cat output looks good" '
	cat mountdir/planets/venus.txt mountdir/planets/venus.txt >expected &&
	test_cmp expected actual
'


test_expect_success "go-random is installed" '
    type random
'

test_add_cat_5MB

test_add_cat_expensive

test_add_named_pipe " Post http://$API_ADDR/api/v0/add?encoding=json&progress=true&r=true&stream-channels=true:"

test_add_pwd_is_symlink

test_kill_ipfs_daemon

# should work offline

test_add_cat_file

test_expect_success "ipfs add --only-hash succeeds" '
    echo "unknown content for only-hash" | ipfs add --only-hash -q > oh_hash
'

#TODO: this doesn't work when online hence separated out from test_add_cat_file
test_expect_success "ipfs cat file fails" '
    test_must_fail ipfs cat $(cat oh_hash)
'

test_add_named_pipe ""

test_add_pwd_is_symlink

# Test daemon in offline mode
test_launch_ipfs_daemon --offline

test_add_cat_file

test_kill_ipfs_daemon

test_done
