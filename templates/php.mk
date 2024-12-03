REPO_ROOT ?= $(shell git rev-parse --show-toplevel)
-include $(REPO_ROOT)/base.mk

update:
	composer update

outdated:
	composer outdated

dump:
	composer dump-autoload --optimize

diagnose:
	composer diagnose

audit:
	composer audit
