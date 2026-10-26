#!/usr/bin/env bash
# ==============================================================================
# ZOTHOS-LITE v1.0 // QEMU/KVM AMNESIC RAM-ONLY VM LAUNCHER
# Boots zothos-lite-1.0-amd64.iso / vmlinuz + initrd-zothos-lite.img in KVM
# with 2048 MB volatile RAM, 0 hard disks, spoofed MAC 02:42:ac:11:00:7f,
# Desktop GTK Window (:0), VNC (:5905), QMP socket, and Serial socket.
# ==============================================================================
set -euo pipefail

VM_DIR="/home/zoth/NullAITech/zothos-lite/vm"
KERNEL="/boot/vmlinuz"
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

echo "[::] Launching ZothOS-Lite v1.0 QEMU/KVM Virtual Machine..."
qemu-system-x86_64 \
  -name "ZothOS-Lite v1.0 // Amnesic 1-Bit Monotone VM (toram noswap)" \
  -enable-kvm \
  -cpu host \
  -smp 2 \
  -m 2048 \
  -kernel "$KERNEL" \
  -initrd "$INITRD" \
  -cdrom "$ISO" \
  -append "toram noswap slab_nomerge init_on_alloc=1 init_on_free=1 console=tty0 console=ttyS0,115200n8 quiet" \
  -nic user,model=virtio-net-pci,mac=02:42:ac:11:00:7f \
  -vga std \
  -display gtk \
  -vnc 127.0.0.1:5 \
  -chardev socket,id=charserial0,path="$SERIAL_SOCK",server=on,wait=off,logfile="$SERIAL_LOG",logappend=on \
  -serial chardev:charserial0 \
  -qmp unix:"$QMP_SOCK",server=on,wait=off \
  -pidfile "$PIDFILE" \
  -daemonize

sleep 2
VM_PID=$(cat "$PIDFILE")
echo "[OK] ZothOS-Lite v1.0 VM online (PID: $VM_PID)"
echo "     • Desktop Display : GTK Window on DISPLAY=$DISPLAY"
echo "     • VNC Endpoint    : 127.0.0.1:5905"
echo "     • Serial Socket   : $SERIAL_SOCK"
echo "     • QMP Socket      : $QMP_SOCK"
echo "     • Console Log     : $SERIAL_LOG"
