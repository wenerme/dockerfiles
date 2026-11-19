#!/bin/sh
# timescaledb-portal-fix.sh <timescaledb source dir>
#
# PostgreSQL 18.7 / 17.12 reject PortalDrop() on a portal that was never started. timescaledb's job
# runner (tsl/src/bgw_policy/job.c) creates such a portal for background-worker runs, so every
# scheduled job (policies, user actions) commits its work and then fails with
# 'cannot drop portal "" while it is being set up' (timescale/timescaledb#11038).
# This is the upstream fix (2.27.3, 2.31.1, ...): mark the portal active when created and done
# before dropping it. Versions that already contain it are left alone; anything else that does not
# match exactly once fails the build.
set -eu
f="$1/tsl/src/bgw_policy/job.c"
active=$(grep -c 'portal->status = PORTAL_ACTIVE;' "$f" || true)
marked=$(grep -c 'MarkPortalDone(portal);' "$f" || true)
if [ "$active" -ge 1 ] && [ "$marked" -ge 1 ]; then
	echo "timescaledb portal fix: already upstream in $1"
	exit 0
fi
[ "$active" = 0 ] && [ "$marked" = 0 ] || { echo "partial portal fix in $f; review it" >&2; exit 1; }
[ "$(grep -c 'portal->resowner = CurrentResourceOwner;' "$f")" = 1 ] || { echo "unexpected portal setup in $f" >&2; exit 1; }
[ "$(grep -c 'PortalDrop(portal, false);' "$f")" = 1 ] || { echo "unexpected PortalDrop in $f" >&2; exit 1; }
awk '
	/portal->resowner = CurrentResourceOwner;/ { print; match($0, /^[ \t]*/); print substr($0, 1, RLENGTH) "portal->status = PORTAL_ACTIVE;"; next }
	/PortalDrop\(portal, false\);/ { match($0, /^[ \t]*/); print substr($0, 1, RLENGTH) "MarkPortalDone(portal);" }
	{ print }
' "$f" > "$f.new"
mv "$f.new" "$f"
if [ "$(grep -c 'portal->status = PORTAL_ACTIVE;' "$f")" != 1 ] || [ "$(grep -c 'MarkPortalDone(portal);' "$f")" != 1 ]; then
	echo "portal fix verification failed in $f" >&2
	exit 1
fi
echo "timescaledb portal fix: applied to $1"
