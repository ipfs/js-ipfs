all: help

test: test_expensive

test_short: test_sharness_short

test_expensive: test_sharness_expensive

test_sharness_short:
	$(MAKE) -j1 -C test/sharness/

test_sharness_expensive:
	TEST_EXPENSIVE=1 $(MAKE) -j1 -C test/sharness/

help:
	@echo 'TESTING TARGETS:'
	@echo ''
	@echo '  test                    - Run expensive tests'
	@echo '  test_short              - Run short tests and sharness tests'
	@echo '  test_expensive          - Run a few extras'
	@echo '  test_sharness_short'
	@echo '  test_sharness_expensive'
	@echo ''
