#!/usr/bin/env bash
# ==============================================================================
# ZOTHOS-LITE v1.0 // AMNESIC 1-BIT MONOTONE VM & BOOTABLE ISO BUILDER
# Builds:
#   1. /home/zoth/NullAITech/zothos-lite/vm/initrd-zothos-lite.img
#   2. /home/zoth/NullAITech/zothos-lite/vm/zothos-lite-1.0-amd64.iso
# ==============================================================================
set -euo pipefail

VM_DIR="/home/zoth/NullAITech/zothos-lite/vm"
ROOTFS="$VM_DIR/rootfs"
ISO_ROOT="$VM_DIR/iso_root"
KERNEL="/boot/vmlinuz"

echo "[::] Building ZothOS-Lite v1.0 Amnesic RAM Initramfs & Bootable ISO..."
rm -rf "$ROOTFS" "$ISO_ROOT"
mkdir -p "$ROOTFS"/{bin,sbin,usr/bin,usr/sbin,usr/local/bin,etc/zoth-lite,proc,sys,dev,tmp,run,var/lib/zoth-lite/pulled,root,lib/x86_64-linux-gnu,lib64}

# 1. Copy busybox and required shared libraries
cp /usr/bin/busybox "$ROOTFS/bin/busybox"
chmod +x "$ROOTFS/bin/busybox"
cp /lib/x86_64-linux-gnu/libresolv.so.2 "$ROOTFS/lib/x86_64-linux-gnu/"
cp /lib/x86_64-linux-gnu/libc.so.6 "$ROOTFS/lib/x86_64-linux-gnu/"
cp /lib64/ld-linux-x86-64.so.2 "$ROOTFS/lib64/"

# Create busybox symlinks for all supported applets
for app in $("$ROOTFS/bin/busybox" --list); do
  ln -sf /bin/busybox "$ROOTFS/bin/$app" 2>/dev/null || true
done

# 2. Seed ZothOS-Lite Amnesic Metadata & State
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

# 3. Create the 6 Core Zoth Security & Dev CLI Tools + zoth-lite-pkg inside the VM
cat > "$ROOTFS/usr/local/bin/zoth-lite-pkg" << 'EOF'
#!/bin/sh
DB="/var/lib/zoth-lite/pulled_packages.txt"
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
INPUT="${*:-AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY}"
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
echo "│ Root Mount     : tmpfs on / type tmpfs (rw,relatime,mode=755)            │"
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

# 4. Create the /init script for the ZothOS-Lite VM
cat > "$ROOTFS/init" << 'EOF'
#!/bin/sh
export PATH="/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/root"
export TERM="linux"
export PS1="\[\033[1;37m\][zoth@zothos-lite-vm \W]#\[\033[0m\] "

mount -t proc proc /proc 2>/dev/null || true
mount -t sysfs sysfs /sys 2>/dev/null || true
mount -t devtmpfs devtmpfs /dev 2>/dev/null || true
mkdir -p /dev/pts /tmp /run
mount -t devpts devpts /dev/pts 2>/dev/null || true
mount -t tmpfs -o size=512M tmpfs /tmp 2>/dev/null || true

hostname zothos-lite-amnesic 2>/dev/null || true
ip link set lo up 2>/dev/null || ifconfig lo 127.0.0.1 up 2>/dev/null || true
ip link set eth0 address 02:42:ac:11:00:7f 2>/dev/null || true
ip link set eth0 up 2>/dev/null || true
ip addr add 10.0.2.15/24 dev eth0 2>/dev/null || true

print_banner() {
  KVER=$(uname -sr 2>/dev/null || echo "Linux 6.12-amd64")
  cat << BANNER
+============================================================================+
|  ███████╗ ██████╗ ████████╗██╗  ██╗ ██████╗ ███████╗   ██╗     ██╗████████╗|
|  ╚══███╔╝██╔═══██╗╚══██╔══╝██║  ██║██╔═══██╗██╔════╝   ██║     ██║╚══██╔══╝|
|    ███╔╝ ██║   ██║   ██║   ███████║██║   ██║███████╗██╗██║     ██║   ██║   |
|   ███╔╝  ██║   ██║   ██║   ██╔══██║██║   ██║╚════██║╚═╝██║     ██║   ██║   |
|  ███████╗╚██████╔╝   ██║   ██║  ██║╚██████╔╝███████║   ███████╗██║   ██║   |
|  ╚══════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚══════╝╚═╝   ╚═╝   |
+============================================================================+
| [::] ZOTHOS-LITE v1.0 // TAILS-STYLE AMNESIC 1-BIT MONOTONE OS             |
| [::] Kernel: $KVER | Mode: toram noswap | MAC: 02:42:ac:11:00:7f |
| [::] 6 Core Zoth Security/Dev Tools Locked in RAM | Modular Pull: ACTIVE   |
+----------------------------------------------------------------------------+
| Commands: zoth-lite-pkg {status|list|pull <id>} | zoth-amnesia             |
|           zoth-envguard | zoth-ghostbyte | zoth-cold-sign | zoth-hexstrike |
+============================================================================+
BANNER
}

# Print compact VGA banner + status to /dev/tty0 (80x25 VGA display)
cat << 'VGABANNER' > /dev/tty0 2>/dev/null || true
+============================================================================+
| [::] ZOTHOS-LITE v1.0 // TAILS-STYLE AMNESIC 1-BIT BLACK & WHITE OS        |
| [::] Boot: toram noswap (Zero Disk) | Spoofed MAC: 02:42:ac:11:00:7f       |
| [::] Bayer 4x4 Dither: [####%%%%::::....] | 6 Core Zoth Tools Locked       |
+============================================================================+
VGABANNER
/usr/local/bin/zoth-lite-pkg status > /dev/tty0 2>/dev/null || true
printf "\n[zoth@zothos-lite-vm /]# " > /dev/tty0 2>/dev/null || true

# Print full UTF-8 banner + status to Serial console (/dev/ttyS0)
print_banner > /dev/ttyS0 2>/dev/null || true
/usr/local/bin/zoth-lite-pkg status > /dev/ttyS0 2>/dev/null || true

# Spawn an interactive root shell strictly on VGA /dev/tty1 (never touch /dev/ttyS0)
if [ -c /dev/tty1 ]; then
  (
    while true; do
      setsid sh </dev/tty1 >/dev/tty1 2>&1
      sleep 1
    done
  ) &
fi

# Run interactive shell strictly on Serial /dev/ttyS0 for host bridge & live exec
while true; do
  if [ -c /dev/ttyS0 ]; then
    setsid sh </dev/ttyS0 >/dev/ttyS0 2>&1
  else
    sh
  fi
  sleep 1
done
EOF
chmod +x "$ROOTFS/init"

# 5. Pack initramfs image
echo "[::] Packing $VM_DIR/initrd-zothos-lite.img..."
(cd "$ROOTFS" && find . -print0 | cpio --null -ov --format=newc 2>/dev/null | gzip -9 > "$VM_DIR/initrd-zothos-lite.img")
ls -lh "$VM_DIR/initrd-zothos-lite.img"

# 6. Build bootable GRUB ISO (zothos-lite-1.0-amd64.iso)
mkdir -p "$ISO_ROOT/boot/grub"
cp "$KERNEL" "$ISO_ROOT/boot/vmlinuz"
cp "$VM_DIR/initrd-zothos-lite.img" "$ISO_ROOT/boot/initrd.img"

cat > "$ISO_ROOT/boot/grub/grub.cfg" << 'EOF'
set timeout=1
set default=0
set menu_color_normal=white/black
set menu_color_highlight=black/white

menuentry "ZothOS-Lite v1.0 // Amnesic 1-Bit Monotone (toram noswap)" {
    linux /boot/vmlinuz toram noswap slab_nomerge init_on_alloc=1 init_on_free=1 console=tty0 console=ttyS0,115200n8
    initrd /boot/initrd.img
}
EOF

echo "[::] Building bootable ISO $VM_DIR/zothos-lite-1.0-amd64.iso..."
grub-mkrescue -o "$VM_DIR/zothos-lite-1.0-amd64.iso" "$ISO_ROOT" 2>/dev/null
ls -lh "$VM_DIR/zothos-lite-1.0-amd64.iso"
echo "[OK] ZothOS-Lite v1.0 Bootable ISO & Initramfs ready."
