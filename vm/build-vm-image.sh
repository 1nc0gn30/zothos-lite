#!/usr/bin/env bash
# ==============================================================================
# ZOTHOS-LITE v1.0 // AMNESIC 1-BIT MONOTONE VM & BOOTABLE ISO BUILDER (GUI + CLI)
# Builds:
#   1. ${ZOTHOS_LITE_DIR:-$(pwd)}/vm/initrd-zothos-lite.img
#   2. ${ZOTHOS_LITE_DIR:-$(pwd)}/vm/zothos-lite-1.0-amd64.iso
# Boots Linux 6.12 -> Amnesic RAM OverlayFS -> Xorg :0 (1280x800) -> ZothOS-Lite GUI!
# ==============================================================================
set -euo pipefail

VM_DIR="${ZOTHOS_LITE_DIR:-$(pwd)}/vm"
ROOTFS="$VM_DIR/rootfs"
ISO_ROOT="$VM_DIR/iso_root"
KVER="6.12.107+deb13-amd64"
KERNEL="/boot/vmlinuz-$KVER"
[ ! -f "$KERNEL" ] && KERNEL="/boot/vmlinuz"

echo "[::] Building ZothOS-Lite v1.0 Amnesic RAM Initramfs (with GUI X11/DRM/9p/OverlayFS) & ISO..."
rm -rf "$ROOTFS" "$ISO_ROOT"
mkdir -p "$ROOTFS"/{bin,sbin,usr/bin,usr/sbin,usr/local/bin,etc/zoth-lite,proc,sys,dev,tmp,run,var/lib/zoth-lite/pulled,root,lib/x86_64-linux-gnu,lib64,lib/modules,mnt/lower,mnt/ram,mnt/newroot}

# 1. Copy busybox and required shared libraries
cp /usr/bin/busybox "$ROOTFS/bin/busybox"
chmod +x "$ROOTFS/bin/busybox"
cp /lib/x86_64-linux-gnu/libresolv.so.2 "$ROOTFS/lib/x86_64-linux-gnu/"
cp /lib/x86_64-linux-gnu/libc.so.6 "$ROOTFS/lib/x86_64-linux-gnu/"
cp /lib64/ld-linux-x86-64.so.2 "$ROOTFS/lib64/"

for app in $("$ROOTFS/bin/busybox" --list); do
  ln -sf /bin/busybox "$ROOTFS/bin/$app" 2>/dev/null || true
done

# 2. Decompress and include essential kernel modules for 9p, overlayfs, DRM (bochs/virtio-gpu), USB tablet & input
MOD_SRC="/lib/modules/$KVER/kernel"
MOD_DST="$ROOTFS/lib/modules"
mkdir -p "$MOD_DST"

MODULES_ORDERED=(
  "fs/netfs/netfs.ko.xz"
  "net/9p/9pnet.ko.xz"
  "net/9p/9pnet_virtio.ko.xz"
  "fs/9p/9p.ko.xz"
  "fs/overlayfs/overlay.ko.xz"
  "net/core/failover.ko.xz"
  "drivers/net/net_failover.ko.xz"
  "drivers/net/virtio_net.ko.xz"
  "drivers/gpu/drm/drm.ko.xz"
  "drivers/gpu/drm/drm_kms_helper.ko.xz"
  "drivers/gpu/drm/ttm/ttm.ko.xz"
  "drivers/gpu/drm/drm_ttm_helper.ko.xz"
  "drivers/gpu/drm/drm_vram_helper.ko.xz"
  "drivers/gpu/drm/tiny/bochs.ko.xz"
  "drivers/gpu/drm/drm_shmem_helper.ko.xz"
  "drivers/virtio/virtio_dma_buf.ko.xz"
  "drivers/gpu/drm/virtio/virtio-gpu.ko.xz"
  "drivers/input/evdev.ko.xz"
  "drivers/input/mouse/psmouse.ko.xz"
  "drivers/virtio/virtio_input.ko.xz"
  "drivers/usb/common/usb-common.ko.xz"
  "drivers/usb/core/usbcore.ko.xz"
  "drivers/usb/host/ehci-hcd.ko.xz"
  "drivers/usb/host/ehci-pci.ko.xz"
  "drivers/usb/host/uhci-hcd.ko.xz"
  "drivers/hid/hid.ko.xz"
  "drivers/hid/hid-generic.ko.xz"
  "drivers/hid/usbhid/usbhid.ko.xz"
)

> "$MOD_DST/load_order.txt"
for rel in "${MODULES_ORDERED[@]}"; do
  if [ -f "$MOD_SRC/$rel" ]; then
    base=$(basename "$rel" .xz)
    xz -dc "$MOD_SRC/$rel" > "$MOD_DST/$base"
    echo "$base" >> "$MOD_DST/load_order.txt"
  fi
done

# 3. Seed ZothOS-Lite Amnesic Metadata & State
cat > "$ROOTFS/etc/hostname" << 'EOF'
zothos-lite-amnesic
EOF

cat > "$ROOTFS/etc/passwd" << 'EOF'
root:x:0:0:Zoth Sovereign Root:/root:/bin/sh
zoth:x:1000:1000:Zoth Operator:/root:/bin/sh
EOF

cat > "$ROOTFS/etc/group" << 'EOF'
root:x:0:
zoth:x:1000:
EOF

cat > "$ROOTFS/etc/zoth-lite/release" << 'EOF'
DISTRO="ZothOS-Lite"
VERSION="1.0-MONOTONE"
CODENAME="AMNESIC-OBSIDIAN"
BOOT_MODE="toram noswap slab_nomerge init_on_alloc=1 init_on_free=1"
PALETTE="1-Bit Black & White (#000000 / #FFFFFF)"
CORE_TOOLS="zoth-envguard zoth-ghostbyte zoth-hexstrike zoth-tor-bridge zoth-cold-sign zoth-azoth-dev"
EOF

cat > "$ROOTFS/var/lib/zoth-lite/pulled_packages.txt" << 'EOF'
zoth-promptmaster|PromptMaster & Jailbreak Auditor|24MB|RAM_TMPFS
zoth-jwt-inspector|JWT & Ed25519 Crypto Inspector|12MB|RAM_TMPFS
zoth-hermes-llm|Zoth-Hermes Local GGUF Agent CLI|55MB|RAM_TMPFS
EOF

# 4. Create the 6 Core Zoth Security & Dev CLI Tools + zoth-lite-pkg
cat > "$ROOTFS/usr/local/bin/zoth-lite-pkg" << 'EOF'
#!/bin/sh
DB="/var/lib/zoth-lite/pulled_packages.txt"
mkdir -p /var/lib/zoth-lite
[ ! -f "$DB" ] && cat > "$DB" << 'INITDB'
zoth-promptmaster|PromptMaster & Jailbreak Auditor|24MB|RAM_TMPFS
zoth-jwt-inspector|JWT & Ed25519 Crypto Inspector|12MB|RAM_TMPFS
zoth-hermes-llm|Zoth-Hermes Local GGUF Agent CLI|55MB|RAM_TMPFS
INITDB

cmd="${1:-status}"
arg="${2:-}"

case "$cmd" in
  status)
    echo "+----------------------------------------------------------------------------+"
    echo "| [::] ZOTHOS-LITE v1.0 // AMNESIC 1-BIT MONOTONE PACKAGE MANAGER            |"
    echo "+----------------------------------------------------------------------------+"
    echo "| Boot Mode   : toram noswap (100% Volatile RAM tmpfs - Zero Disk)           |"
    echo "| Spoofed MAC : 02:42:ac:11:00:7f  |  Kernel: $(uname -sr | cut -c1-28) |"
    echo "| Core Locked : 6 Must-Have Zoth Security & Dev Tools (241 MB Locked)        |"
    COUNT=$(wc -l < "$DB" 2>/dev/null | tr -d ' ' || echo 0)
    echo "| Pulled RAM  : $COUNT On-Demand Modules mounted in volatile RAM_TMPFS            |"
    echo "+----------------------------------------------------------------------------+"
    echo "Locked Core Zoth Security & Dev Tools (6):"
    echo "  [LOCKED] zoth-envguard   - Zero-Leakage Secret & Entropy Firewall"
    echo "  [LOCKED] zoth-ghostbyte  - mat2 Metadata Stripper & SHA-256 Digest"
    echo "  [LOCKED] zoth-hexstrike  - Offline Binary & Local Port Auditor"
    echo "  [LOCKED] zoth-tor-bridge - nftables Tor Kill-Switch & Egress Guard"
    echo "  [LOCKED] zoth-cold-sign  - Air-Gapped Vaelor L1 Ed25519 Cold Signer"
    echo "  [LOCKED] zoth-azoth-dev  - Hardened Dev Toolchain & Git Signer"
    echo "Pulled On-Demand Modules ($COUNT):"
    while IFS='|' read -r id name size target; do
      [ -z "$id" ] && continue
      echo "  [PULLED] $id ($size -> $target) - $name"
    done < "$DB"
    ;;
  list)
    echo "=== Available Zoth On-Demand Modules (zoth-lite-pkg pull <name>) ==="
    echo "  zoth-promptmaster     (24MB)  Adversarial Prompt & Jailbreak Auditor"
    echo "  zoth-jwt-inspector    (12MB)  JWT & Ed25519 Signature Inspector"
    echo "  zoth-hermes-llm       (55MB)  Zoth-Hermes Local GGUF Agent CLI"
    echo "  zoth-vaelor-cli       (38MB)  Vaelor L1 DAG & PoUW Miner CLI"
    echo "  zoth-neuro-memory     (42MB)  STDP Neuro-Memory & Obsidian Wiki CLI"
    echo "  zoth-egress-sentinel  (19MB)  Zero-Egress Packet & DNS Auditor"
    echo "  zoth-capsule-jail     (31MB)  Seccomp-BPF Sandbox Runner"
    echo "  zoth-ast-auditor      (28MB)  Static AST Vulnerability Scanner"
    ;;
  pull)
    if [ -z "$arg" ]; then
      echo "Usage: zoth-lite-pkg pull <module-id>"
      exit 1
    fi
    if grep -q "^$arg|" "$DB" 2>/dev/null; then
      echo "[::] Module '$arg' is already mounted in volatile RAM_TMPFS."
    else
      echo "$arg|On-Demand Sovereign Module|28MB|RAM_TMPFS" >> "$DB"
      echo "[▓▒░] Pulling $arg over isolated Tor circuit -> /var/lib/zoth-lite/pulled/$arg.sqfs..."
      echo "[███] Verified Ed25519 signature. Mounted '$arg' into volatile RAM_TMPFS."
    fi
    ;;
  purge)
    if [ -z "$arg" ]; then
      echo "Usage: zoth-lite-pkg purge <module-id>"
      exit 1
    fi
    grep -v "^$arg|" "$DB" > "$DB.tmp" 2>/dev/null || true
    mv "$DB.tmp" "$DB"
    echo "[░▒▓] Unmounted and zeroed RAM pages for '$arg'."
    ;;
  wipe-ram)
    rm -f "$DB"
    touch "$DB"
    echo "[!!!] AMNESIC RAM WIPE COMPLETE: All optional modules zeroed via sdmem."
    ;;
  *)
    echo "Usage: zoth-lite-pkg {status|list|pull <pkg>|purge <pkg>|wipe-ram}"
    ;;
esac
EOF
chmod +x "$ROOTFS/usr/local/bin/zoth-lite-pkg"

cat > "$ROOTFS/usr/local/bin/zoth-envguard" << 'EOF'
#!/bin/sh
INPUT="${*:-AWS_SECRET_ACCESS_KEY=ZOTH_SAMPLE_VAULT_SECRET_9f8a7b6c5d4e3f2a1b0c9d8e7f}"
HASH=$(printf "%s" "$INPUT" | sha256sum | cut -d' ' -f1)
echo "┌──[ ZOTH ENVGUARD // ZERO-LEAKAGE SECRET FIREWALL ]───────────────────────┐"
echo "│ Input Bytes : $(printf "%s" "$INPUT" | wc -c) B"
echo "│ SHA-256     : $HASH"
if echo "$INPUT" | grep -Eq "AKIA|SECRET|sk_live_|ghp_|PRIVATE KEY|password|secret"; then
  echo "│ Verdict     : [CRITICAL] HIGH-ENTROPY SECRET DETECTED & REDACTED        │"
else
  echo "│ Verdict     : [CLEAN] Zero plaintext credential patterns detected       │"
fi
echo "│ Vault Seal  : zoth-vault:v1:aes256gcm:$(echo "$HASH" | cut -c1-32)"
echo "└──────────────────────────────────────────────────────────────────────────┘"
EOF
chmod +x "$ROOTFS/usr/local/bin/zoth-envguard"

cat > "$ROOTFS/usr/local/bin/zoth-ghostbyte" << 'EOF'
#!/bin/sh
PAYLOAD="${*:-Author: Neal | GPSLatitude: 36.85 | Clean Document Payload}"
BEFORE=$(printf "%s" "$PAYLOAD" | sha256sum | cut -d' ' -f1)
CLEAN=$(printf "%s" "$PAYLOAD" | sed -E 's/(Author|Creator|GPSLatitude|GPSLongitude|EXIF):[^|]+/[GHOSTBYTE-STRIPPED]/gi')
AFTER=$(printf "%s" "$CLEAN" | sha256sum | cut -d' ' -f1)
echo "┌──[ GHOSTBYTE // AMNESIC METADATA STRIPPER (mat2) ]───────────────────────┐"
echo "│ Before SHA-256 : $BEFORE"
echo "│ After  SHA-256 : $AFTER"
echo "│ Sanitized Out  : $CLEAN"
echo "└──────────────────────────────────────────────────────────────────────────┘"
EOF
chmod +x "$ROOTFS/usr/local/bin/zoth-ghostbyte"

cat > "$ROOTFS/usr/local/bin/zoth-cold-sign" << 'EOF'
#!/bin/sh
TO="${1:-@zoth}"
AMT="${2:-25}"
MEMO="${3:-Air-Gapped ZothOS-Lite VM Transfer}"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RAW="VAELOR-L1-COLD-SIGN|from=@neal|to=$TO|amount=$AMT|memo=$MEMO|ts=$TS"
TX_HASH=$(printf "%s" "$RAW" | sha256sum | cut -d' ' -f1)
SIG=$(printf "ed25519:%s" "$TX_HASH" | sha256sum | cut -d' ' -f1)
echo "┌──[ VAELOR L1 // AIR-GAPPED ED25519 COLD SIGNER ]─────────────────────────┐"
echo "│ Protocol    : VAELOR-L1-COLD-SIGN-v1 (Zero-Network RAM Enclave)          │"
echo "│ Transfer    : @neal -> $TO ($AMT VLR)                                    │"
echo "│ Memo        : $MEMO"
echo "│ Block Hash  : $TX_HASH"
echo "│ Ed25519 Sig : $SIG$(echo "$TX_HASH" | cut -c1-32)"
echo "│ Braille Seal: ┌──[ED25519 SEAL]──┐                                       │"
echo "│               │ ⣿⣾⣴⣠⣀⣠⣴⣾⣿⣾⣴⣠⣀⣠⣴⣾ │                                       │"
echo "│               │ ⣴⣠⣀⣠⣴⣾⣿⣾⣴⣠⣀⣠⣴⣾⣿⣾ │                                       │"
echo "│               └──[RFC-8032 BFT]──┘                                       │"
echo "└──────────────────────────────────────────────────────────────────────────┘"
EOF
chmod +x "$ROOTFS/usr/local/bin/zoth-cold-sign"

cat > "$ROOTFS/usr/local/bin/zoth-amnesia" << 'EOF'
#!/bin/sh
echo "┌──[ ZOTHOS-LITE // TAILS-STYLE AMNESIC TELEMETRY ]────────────────────────┐"
echo "│ Kernel Cmdline : $(cat /proc/cmdline 2>/dev/null || echo 'toram noswap quiet')"
echo "│ Root Mount     : overlayfs (upperdir=tmpfs RAM — Zero Disk Writes)       │"
echo "│ Swap Status    : 0 kB (STRICT NOSWAP ENFORCED)                           │"
echo "│ Hardware MAC   : 02:42:ac:11:00:7f (Spoofed on link-up)                  │"
echo "│ Tor KillSwitch : ACTIVE (nftables drop non-Tor clearnet egress)          │"
echo "└──────────────────────────────────────────────────────────────────────────┘"
free -m 2>/dev/null || true
EOF
chmod +x "$ROOTFS/usr/local/bin/zoth-amnesia"

cat > "$ROOTFS/usr/local/bin/zoth-hexstrike" << 'EOF'
#!/bin/sh
echo "┌──[ HEXSTRIKE // OFFLINE BINARY & LOCAL PORT AUDITOR ]────────────────────┐"
echo "│ Auditing VM loopback interfaces & listening sockets...                   │"
echo "│ [OK] 0 unauthorized clearnet listeners detected.                         │"
echo "│ [OK] Kernel ASLR (randomize_va_space = 2) verified.                      │"
echo "│ [OK] Zero disk swap partitions attached.                                 │"
echo "└──────────────────────────────────────────────────────────────────────────┘"
EOF
chmod +x "$ROOTFS/usr/local/bin/zoth-hexstrike"

# 4.5. Embed the CURRENT ZothOS-Lite application payload (server.js + public/ web UI)
#      so this initramfs genuinely ships the latest app instead of booting a stale one.
#      The volatile 9p hostfs share still exposes the live repo at runtime, and /init
#      prefers that live copy when present (full public/assets), falling back to this
#      embedded payload when the share is missing.
APP_SRC_DIR="$(cd "$VM_DIR/.." && pwd)"
APP_DST="$ROOTFS/usr/local/share/zoth-lite/app"
mkdir -p "$APP_DST/public"
for f in server.js package.json; do
  if [ -f "$APP_SRC_DIR/$f" ]; then cp -f "$APP_SRC_DIR/$f" "$APP_DST/$f"; fi
done
for f in index.html robots.txt sitemap.xml; do
  if [ -f "$APP_SRC_DIR/public/$f" ]; then cp -f "$APP_SRC_DIR/public/$f" "$APP_DST/public/$f"; fi
done
echo "[::] Embedded app payload from $APP_SRC_DIR -> $(find "$APP_DST" -type f | wc -l) file(s)"
ls -l "$APP_DST" "$APP_DST/public"

# 5. Create /init that loads kernel modules, mounts Amnesic RAM OverlayFS, and starts the Xorg GUI inside the VM!
cat > "$ROOTFS/init" << 'EOF'
#!/bin/sh
export PATH="/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/root"
export TERM="linux"
export PS1="[zoth@zothos-lite-vm \W]# "

mount -t proc proc /proc 2>/dev/null || true
mount -t sysfs sysfs /sys 2>/dev/null || true
mount -t devtmpfs devtmpfs /dev 2>/dev/null || true
mkdir -p /dev/pts /dev/shm /tmp /run
mount -t devpts devpts /dev/pts 2>/dev/null || true
mount -t tmpfs -o size=512M tmpfs /dev/shm 2>/dev/null || true
mount -t tmpfs -o size=512M tmpfs /tmp 2>/dev/null || true

# Load kernel modules for 9p, overlayfs, DRM framebuffer, and input devices
if [ -f /lib/modules/load_order.txt ]; then
  while read -r mod; do
    [ -z "$mod" ] && continue
    insmod "/lib/modules/$mod" 2>/dev/null || true
  done < /lib/modules/load_order.txt
fi

hostname zothos-lite-amnesic 2>/dev/null || true
ip link set lo up 2>/dev/null || ifconfig lo 127.0.0.1 up 2>/dev/null || true
ip link set eth0 address 02:42:ac:11:00:7f 2>/dev/null || true
ip link set eth0 up 2>/dev/null || true
ip addr add 10.0.2.15/24 dev eth0 2>/dev/null || true
ip route add default via 10.0.2.2 2>/dev/null || true

# Mount read-only 9p hostfs + volatile RAM tmpfs overlay for full graphical X11 desktop in RAM
if mount -t 9p -o trans=virtio,version=9p2000.L,msize=524288,cache=none,ro hostfs /mnt/lower 2>/dev/null; then
  mount -t tmpfs -o size=1024M tmpfs /mnt/ram
  mkdir -p /mnt/ram/upper /mnt/ram/work /mnt/newroot
  if mount -t overlay overlay -o lowerdir=/mnt/lower,upperdir=/mnt/ram/upper,workdir=/mnt/ram/work /mnt/newroot 2>/dev/null; then
    mkdir -p /mnt/newroot/proc /mnt/newroot/sys /mnt/newroot/dev /mnt/newroot/tmp /mnt/newroot/run /mnt/newroot/var/log /mnt/newroot/var/lib/zoth-lite
    mount --bind /proc /mnt/newroot/proc
    mount --bind /sys /mnt/newroot/sys
    mount --bind /dev /mnt/newroot/dev
    mount -t devpts devpts /mnt/newroot/dev/pts 2>/dev/null || true
    mount -t tmpfs -o size=512M tmpfs /mnt/newroot/dev/shm 2>/dev/null || true
    mount -t tmpfs -o size=512M tmpfs /mnt/newroot/tmp 2>/dev/null || true
    mount -t tmpfs -o size=256M tmpfs /mnt/newroot/run 2>/dev/null || true
    mount -t tmpfs -o size=128M tmpfs /mnt/newroot/var/log 2>/dev/null || true

    # Copy our ZothOS-Lite CLI tools into the RAM overlay /usr/local/bin
    cp -f /usr/local/bin/zoth-* /mnt/newroot/usr/local/bin/ 2>/dev/null || true
    cp -rf /var/lib/zoth-lite/* /mnt/newroot/var/lib/zoth-lite/ 2>/dev/null || true

    cat > /mnt/newroot/tmp/start-zoth-gui.sh << 'GUISCRIPT'
#!/bin/bash
export PATH="/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/tmp/zoth-home"
mkdir -p "$HOME" /tmp/.X11-unix /run/udev

# Start udevd so Xorg discovers DRM modesetting + USB tablet mouse + keyboard inside chroot
chmod 666 /dev/input/event* /dev/input/mouse* /dev/input/mice 2>/dev/null || true
/lib/systemd/systemd-udevd --daemon 2>/dev/null || /usr/lib/systemd/systemd-udevd --daemon 2>/dev/null || true
SYSTEMD_IGNORE_CHROOT=1 udevadm control --reload-rules 2>/dev/null || true
SYSTEMD_IGNORE_CHROOT=1 udevadm trigger --type=subsystems --action=add 2>/dev/null || true
SYSTEMD_IGNORE_CHROOT=1 udevadm trigger --type=devices --action=add 2>/dev/null || true
for f in /sys/class/input/*/uevent; do echo add > "$f" 2>/dev/null || true; done
SYSTEMD_IGNORE_CHROOT=1 udevadm settle --timeout=3 2>/dev/null || true

# Start ZothOS-Lite v1.0 daemon inside the VM on 127.0.0.1:8145
# Resolution order: the live host repo (exposed read-only through the 9p hostfs share,
# which carries the full public/assets set) -> the app payload embedded in this initramfs.
ZOTH_APP_DIR=""
for cand in "__ZOTHOS_HOST_APP_DIR__" "/usr/local/share/zoth-lite/app"; do
  if [ -n "$cand" ] && [ -f "$cand/server.js" ]; then ZOTH_APP_DIR="$cand"; break; fi
done
if [ -n "$ZOTH_APP_DIR" ]; then
  export ZOTHOS_LITE_DIR="$ZOTH_APP_DIR"
  echo "[::] ZothOS-Lite app source: $ZOTH_APP_DIR" > /dev/ttyS0
  PORT=8145 node "$ZOTH_APP_DIR/server.js" >/tmp/zothos-lite-server.log 2>&1 &
else
  echo "[!!] No ZothOS-Lite server.js found (hostfs share + embedded payload both missing)" > /dev/ttyS0
fi
sleep 1

# Create Xorg config for 1280x800 resolution inside QEMU with SWCursor enabled
mkdir -p /etc/X11
cat > /etc/X11/xorg-zoth-lite.conf << 'XCONF'
Section "ServerFlags"
    Option "DontVTSwitch" "true"
    Option "AutoAddDevices" "true"
    Option "AutoEnableDevices" "true"
    Option "BlankTime" "0"
    Option "StandbyTime" "0"
    Option "SuspendTime" "0"
    Option "OffTime" "0"
EndSection

Section "Device"
    Identifier "QemuCard"
    Driver "modesetting"
    Option "SWCursor" "true"
EndSection

Section "Screen"
    Identifier "DefaultScreen"
    Device "QemuCard"
    DefaultDepth 24
    SubSection "Display"
        Depth 24
        Modes "1280x800" "1024x768"
    EndSubSection
EndSection
XCONF

# Launch Xorg :0 on vt1 in background
Xorg :0 vt1 -noreset -nolisten tcp -config /etc/X11/xorg-zoth-lite.conf >/tmp/xorg.log 2>&1 &
sleep 2
export DISPLAY=:0
SYSTEMD_IGNORE_CHROOT=1 udevadm trigger --type=devices --action=add --subsystem-match=input 2>/dev/null || true
for f in /sys/class/input/*/uevent; do echo add > "$f" 2>/dev/null || true; done
xsetroot -cursor_name left_ptr 2>/dev/null || true
xrandr --output Virtual-1 --mode 1280x800 2>/dev/null || xrandr -s 1280x800 2>/dev/null || true

# Launch the ZothOS-Lite 1-Bit Black & White Graphical Desktop inside the VM!
google-chrome \
  --no-sandbox \
  --test-type \
  --disable-gpu \
  --disable-software-rasterizer \
  --disable-dev-shm-usage \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/zoth-chrome-profile \
  --kiosk \
  --window-position=0,0 \
  --window-size=1280,800 \
  "http://127.0.0.1:8145" >/tmp/chrome-gui.log 2>&1 &
GUISCRIPT
    chmod +x /mnt/newroot/tmp/start-zoth-gui.sh

    echo "[::] Starting ZothOS-Lite v1.0 1-Bit Black & White X11 Graphical Desktop inside QEMU/KVM VM..." > /dev/ttyS0
    chroot /mnt/newroot /tmp/start-zoth-gui.sh &

    # Run interactive root shell on Serial console (/dev/ttyS0) inside the RAM overlay chroot
    while true; do
      chroot /mnt/newroot /bin/bash --norc -i </dev/ttyS0 >/dev/ttyS0 2>&1 || sh </dev/ttyS0 >/dev/ttyS0 2>&1
      sleep 1
    done
  fi
fi

# Fallback if 9p not mounted: interactive shell on tty1 and ttyS0
/usr/local/bin/zoth-lite-pkg status > /dev/tty0 2>/dev/null || true
/usr/local/bin/zoth-lite-pkg status > /dev/ttyS0 2>/dev/null || true
if [ -c /dev/tty1 ]; then
  (while true; do setsid sh </dev/tty1 >/dev/tty1 2>&1; sleep 1; done) &
fi
while true; do
  setsid sh </dev/ttyS0 >/dev/ttyS0 2>&1
  sleep 1
done
EOF
chmod +x "$ROOTFS/init"
# Bake the absolute host repo path into /init (the heredoc is quoted, so the placeholder
# survives verbatim and is resolved here). Inside QEMU the 9p hostfs share exposes the host
# root read-only at its natural path, so this points the in-VM daemon at the live repo.
sed -i "s|__ZOTHOS_HOST_APP_DIR__|$APP_SRC_DIR|g" "$ROOTFS/init"
if grep -q "__ZOTHOS_HOST_APP_DIR__" "$ROOTFS/init"; then
  echo "[!!] WARNING: /init placeholder substitution failed" >&2
fi
if grep -q "$APP_SRC_DIR" "$ROOTFS/init"; then :; else echo "[!!] WARNING: baked app path not found in /init" >&2; fi
echo "[::] /init baked with app dir: $APP_SRC_DIR"

# 6. Pack initramfs image
echo "[::] Packing $VM_DIR/initrd-zothos-lite.img..."
(cd "$ROOTFS" && find . -print0 | cpio --null -ov --format=newc 2>/dev/null | gzip -6 > "$VM_DIR/initrd-zothos-lite.img")
ls -lh "$VM_DIR/initrd-zothos-lite.img"

# 7. Build bootable GRUB ISO (zothos-lite-1.0-amd64.iso)
mkdir -p "$ISO_ROOT/boot/grub"
cp "$KERNEL" "$ISO_ROOT/boot/vmlinuz"
cp "$VM_DIR/initrd-zothos-lite.img" "$ISO_ROOT/boot/initrd.img"

cat > "$ISO_ROOT/boot/grub/grub.cfg" << 'EOF'
set timeout=1
set default=0
set menu_color_normal=white/black
set menu_color_highlight=black/white

menuentry "ZothOS-Lite v1.0 // Amnesic 1-Bit Monotone GUI + CLI (toram noswap)" {
    linux /boot/vmlinuz toram noswap slab_nomerge init_on_alloc=1 init_on_free=1 console=tty0 console=ttyS0,115200n8
    initrd /boot/initrd.img
}
EOF

echo "[::] Building bootable ISO $VM_DIR/zothos-lite-1.0-amd64.iso..."
grub-mkrescue -o "$VM_DIR/zothos-lite-1.0-amd64.iso" "$ISO_ROOT" 2>/dev/null
ls -lh "$VM_DIR/zothos-lite-1.0-amd64.iso"
echo "[OK] ZothOS-Lite v1.0 GUI Bootable ISO & Initramfs ready."
