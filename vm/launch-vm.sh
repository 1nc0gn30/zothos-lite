#!/usr/bin/env bash
# ==============================================================================
# ZOTHOS-LITE v1.0 // QEMU/KVM AMNESIC RAM-ONLY GUI VM LAUNCHER
# Boots zothos-lite-1.0-amd64.iso / vmlinuz + initrd-zothos-lite.img in KVM
# with 3072 MB volatile RAM, 4 vCPUs, 0 hard disks, Amnesic RAM OverlayFS,
# Xorg :0 (1280x800) + ZothOS-Lite 1-Bit Black & White Graphical Desktop!
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VM_DIR="${ZOTHOS_LITE_DIR:-$(dirname "$SCRIPT_DIR")}/vm"
KERNEL="/boot/vmlinuz-6.12.107+deb13-amd64"
[ ! -f "$KERNEL" ] && KERNEL="/boot/vmlinuz"
INITRD="$VM_DIR/initrd-zothos-lite.img"
ISO="$VM_DIR/zothos-lite-1.0-amd64.iso"
PIDFILE="/tmp/zothos-lite-vm.pid"
SERIAL_SOCK="/tmp/zothos-lite-serial.sock"
QMP_SOCK="/tmp/zothos-lite-qmp.sock"
SERIAL_LOG="/tmp/zothos-lite-vm-console.log"

# Stop existing VM if running
if [ -f "$PIDFILE" ]; then
  OLD_PID=$(cat "$PIDFILE" 2>/dev/null || true)
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PIDFILE"
fi
rm -f "$SERIAL_SOCK" "$QMP_SOCK"

export DISPLAY="${DISPLAY:-:0}"
export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/1000}"
XAUTH_FILE=$(ls /run/user/1000/xauth_* 2>/dev/null | head -n 1 || true)
if [ -n "$XAUTH_FILE" ]; then
  export XAUTHORITY="$XAUTH_FILE"
fi

echo "[::] Launching ZothOS-Lite v1.0 QEMU/KVM Graphical Virtual Machine (Xorg 1280x800 GUI)..."
qemu-system-x86_64 \
  -name "ZothOS-Lite v1.0 // Amnesic 1-Bit Monotone OS (GUI + RAM Overlay)" \
  -enable-kvm \
  -cpu host \
  -smp 4 \
  -m 3072 \
  -kernel "$KERNEL" \
  -initrd "$INITRD" \
  -cdrom "$ISO" \
  -append "toram noswap slab_nomerge init_on_alloc=1 init_on_free=1 console=tty0 console=ttyS0,115200n8 quiet" \
  -virtfs local,path=/,mount_tag=hostfs,security_model=none,readonly=on \
  -nic user,model=virtio-net-pci,mac=02:42:ac:11:00:7f \
  -vga std \
  -global VGA.vgamem_mb=64 \
  -usb \
  -device usb-ehci,id=ehci \
  -device usb-tablet,bus=ehci.0 \
  -device usb-kbd,bus=ehci.0 \
  -display gtk,zoom-to-fit=on \
  -vnc 127.0.0.1:5 \
  -chardev socket,id=charserial0,path="$SERIAL_SOCK",server=on,wait=off,logfile="$SERIAL_LOG",logappend=on \
  -serial chardev:charserial0 \
  -qmp unix:"$QMP_SOCK",server=on,wait=off \
  -pidfile "$PIDFILE" \
  -daemonize

sleep 2
VM_PID=$(cat "$PIDFILE")
echo "[OK] ZothOS-Lite v1.0 Graphical VM online (PID: $VM_PID)"
echo "     • Desktop Display : GTK Window on DISPLAY=$DISPLAY (1280x800 X11 GUI)"
echo "     • VNC Endpoint    : 127.0.0.1:5905"
echo "     • Serial Socket   : $SERIAL_SOCK"
echo "     • QMP Socket      : $QMP_SOCK"
