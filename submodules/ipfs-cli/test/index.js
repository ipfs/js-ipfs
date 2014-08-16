var test = require('tape');
var cp = require('child_process');
var path = require('path');

var fixturesPath = path.join(__dirname, 'fixtures');
var opts = { cwd: fixturesPath };

test('add single file', function (t) {
  t.plan(3);

  cp.exec('ipfs add foo', opts, function(err, stdout, stderr) {

    var expectedStdout = 'foo: added block /5duKSVkSnhkgrxPH5VPkAKEp85e455\n';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

test('return error when folder is added without `-r` flag', function (t) {
  t.plan(3);

  cp.exec('ipfs add ipfs-cli-test-folder/', opts, function(err, stdout, stderr) {

    var expectedStderr = 'ipfs-cli-test-folder/: ignored (use -r for recursive)\n';

    t.error(err);
    t.equal(stdout, '', 'No output on stdout');
    t.equal(stderr, expectedStderr, 'Correct stderr');
  });
});

// This test is flaky since the order of the output is not deterministic.
test('add a folder', function (t) {
  t.plan(3);

  cp.exec('ipfs add -r ipfs-cli-test-folder/', opts, function(err, stdout, stderr) {

    var expectedStdout = [
      'ipfs-cli-test-folder/foo: added block /5duGBb9uHuKx6Ws85NhQE8Vkw1Lkjm',
      'ipfs-cli-test-folder/qux: added block /5dry7LqtUiY1EQotqiigJxS2e3tvxx',
      'ipfs-cli-test-folder/bar/baz: added block /5dtpFqU7B9Lp2oieyQwrhiAGBxwwCF',
      'ipfs-cli-test-folder/bar: added tree /5dtDk8iQKBTMHpKnyrvkGUdDoRCoog',
      'ipfs-cli-test-folder/: added tree /5duMCCrptmJ7mX1hvzjZByrwqrebeh'
    ].join('\n') + '\n';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

test('list tree (w/ blocks & subtrees)', function (t) {
  t.plan(3);

  cp.exec('ipfs ls /5duMCCrptmJ7mX1hvzjZByrwqrebeh', opts, function(err, stdout, stderr) {

    var expectedStdout = [
      '5dtDk8iQKBTMHpKnyrvkGUdDoRCoog 72 bar',
      '5duGBb9uHuKx6Ws85NhQE8Vkw1Lkjm 27 foo',
      '5dry7LqtUiY1EQotqiigJxS2e3tvxx 27 qux'
    ].join('\n') + '\n';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

test('list tree (w/ blocks only)', function (t) {
  t.plan(3);

  cp.exec('ipfs ls 5dtDk8iQKBTMHpKnyrvkGUdDoRCoog', opts, function(err, stdout, stderr) {

    var expectedStdout = '5dtpFqU7B9Lp2oieyQwrhiAGBxwwCF 31 baz\n';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

test('cat a block', function (t) {
  t.plan(3);

  cp.exec('ipfs cat 5dtpFqU7B9Lp2oieyQwrhiAGBxwwCF', opts, function(err, stdout, stderr) {

    var expectedStdout = 'ipfs-cli-test-folder/bar/baz\n';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

// The behavior of cat-ing a tree hash is not yet defined. In the future, there
// may be a special "index" file (like index.html or index.js) or possibly
// support for various index strategies (depending on the type of index content
// the seeking process wants);
test('cat a tree', function (t) {
  t.plan(3);

  cp.exec('ipfs cat 5dtDk8iQKBTMHpKnyrvkGUdDoRCoog', opts, function(err, stdout, stderr) {

    var expectedStdout = '\n\x04\b\x00\x10\x00';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

test('cat a block via a tree path', function (t) {
  t.plan(3);

  cp.exec('ipfs cat 5dtDk8iQKBTMHpKnyrvkGUdDoRCoog/baz', opts, function(err, stdout, stderr) {

    var expectedStdout = 'ipfs-cli-test-folder/bar/baz\n';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

test('recursively list child references for a reference', function (t) {
  t.plan(3);

  cp.exec('ipfs refs -r /5duMCCrptmJ7mX1hvzjZByrwqrebeh', opts, function(err, stdout, stderr) {

    var expectedStdout = [
      '5dtDk8iQKBTMHpKnyrvkGUdDoRCoog',
      '5duGBb9uHuKx6Ws85NhQE8Vkw1Lkjm',
      '5dry7LqtUiY1EQotqiigJxS2e3tvxx',
      '5dtpFqU7B9Lp2oieyQwrhiAGBxwwCF'
    ].join('\n') + '\n';

    t.error(err);
    t.equal(stdout, expectedStdout, 'Correct stdout');
    t.equal(stderr, '', 'No output on stderr');
  });
});

