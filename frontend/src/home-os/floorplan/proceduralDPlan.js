export const D_PLAN_ROOMS = [
  { id: 'living_dining', name: '客餐厅', aliases: ['客餐厅', '客厅', 'living room', 'living'], x: -3, z: 0.58, width: 5, depth: 4.45, color: '#d8d3c8', lightObject: 'Light_LivingDining' },
  { id: 'balcony', name: '阳台', aliases: ['阳台', 'balcony'], x: -3, z: 3.55, width: 5, depth: 1.5, color: '#b9c4c3', lightObject: 'Light_Balcony' },
  { id: 'kitchen', name: '厨房', aliases: ['厨房', 'kitchen'], x: -1.88, z: -2.98, width: 2.55, depth: 2.65, color: '#b8b3a8', lightObject: 'Light_Kitchen' },
  { id: 'guest_bath', name: '公卫', aliases: ['公卫', '客卫', '次卫', 'guest bath'], x: 0.23, z: -2.98, width: 1.65, depth: 2.65, color: '#87949a', lightObject: 'Light_GuestBath' },
  { id: 'north_bedroom', name: '北卧室', aliases: ['北卧', '书房', 'bedroom 3', 'bedroom_3'], x: 2.38, z: -2.98, width: 2.65, depth: 2.65, color: '#a8845f', lightObject: 'Light_NorthBedroom' },
  { id: 'primary_bath', name: '主卫', aliases: ['主卫', 'primary bath', 'master bath'], x: 4.58, z: -2.93, width: 1.75, depth: 2.75, color: '#87949a', lightObject: 'Light_PrimaryBath' },
  { id: 'west_bedroom', name: '次卧', aliases: ['次卧', '儿童房', 'bedroom 2', 'bedroom_2'], x: 0.9, z: 0.08, width: 2.8, depth: 3.45, color: '#a8845f', lightObject: 'Light_WestBedroom' },
  { id: 'east_bedroom', name: '主卧', aliases: ['主卧', 'primary bedroom', 'master bedroom'], x: 3.9, z: 0.08, width: 3.2, depth: 3.45, color: '#a8845f', lightObject: 'Light_EastBedroom' },
];

// Wall segments follow the supplied D-plan drawing. Units are metres.
export const D_PLAN_WALLS = [
  [-5.5, -1.65, -3.15, -1.65], [-3.15, -1.65, -3.15, -4.3], [-3.15, -4.3, 5.5, -4.3],
  [5.5, -4.3, 5.5, 1.8], [5.5, 1.8, -0.5, 1.8], [-0.5, 1.8, -0.5, 2.8],
  [-0.5, 2.8, -5.5, 2.8], [-5.5, 2.8, -5.5, -1.65],
  [-5.5, 2.8, -5.5, 4.3], [-5.5, 4.3, -0.5, 4.3], [-0.5, 4.3, -0.5, 2.8],
  [-0.6, -4.3, -0.6, -1.65], [1.05, -4.3, 1.05, -1.65], [3.7, -4.3, 3.7, -1.65],
  [-3.15, -1.65, -0.5, -1.65], [0.4, -1.65, 1.9, -1.65], [2.8, -1.65, 5.5, -1.65],
  [-0.5, -1.65, -0.5, 1.8], [2.3, -1.65, 2.3, 1.8],
];

export function resolveDPlanConfig(config = {}) {
  return {
    layout: 'd99',
    camera: { position: [10.8, 12.5, 12.8], target: [0, 0, 0], ...(config.camera || {}) },
    ...config,
    rooms: config.rooms?.length ? config.rooms : D_PLAN_ROOMS.map(({ id, name, aliases, lightObject }) => ({ id, name, aliases, lightObject, objectNames: [`Room_${id}`] })),
    lights: config.lights || [],
  };
}

const makeLabel = (THREE, text) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(20, 24, 23, .72)';
  if (context.roundRect) {
    context.beginPath();
    context.roundRect(18, 16, 220, 62, 20);
    context.fill();
  } else {
    context.fillRect(18, 16, 220, 62);
  }
  context.fillStyle = '#f7f4ed';
  context.font = '600 30px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 48);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.65, 0.62, 1);
  return sprite;
};

export function createProceduralDPlan(THREE) {
  const root = new THREE.Group();
  root.name = 'HomeOS_D99';

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(11.35, 0.16, 8.95),
    new THREE.MeshStandardMaterial({ color: '#4d514f', roughness: 0.92 }),
  );
  base.position.y = -0.1;
  root.add(base);

  D_PLAN_ROOMS.forEach((room) => {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(room.width - 0.1, 0.1, room.depth - 0.1),
      new THREE.MeshStandardMaterial({ color: room.color, roughness: 0.78, metalness: 0.02 }),
    );
    floor.name = `Room_${room.id}`;
    floor.userData.roomId = room.id;
    floor.position.set(room.x, 0.02, room.z);
    floor.receiveShadow = true;
    root.add(floor);

    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.035, 28),
      new THREE.MeshStandardMaterial({ color: '#efe3c7', emissive: '#24262b', emissiveIntensity: 0.08 }),
    );
    light.name = room.lightObject;
    light.userData.roomId = room.id;
    light.position.set(room.x, 0.13, room.z);
    root.add(light);

    const label = makeLabel(THREE, room.name);
    label.name = `Label_${room.id}`;
    label.userData.roomId = room.id;
    label.position.set(room.x, 0.72, room.z);
    root.add(label);

    const markerTypes = ['presence', 'climate', 'curtain', 'media'];
    markerTypes.forEach((type, markerIndex) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 18, 14),
        new THREE.MeshStandardMaterial({ color: '#68706e', emissive: '#202523', emissiveIntensity: 0.15, roughness: 0.42 }),
      );
      marker.name = `Hotspot_${type}_${room.id}`;
      marker.userData.roomId = room.id;
      marker.userData.deviceType = type;
      marker.position.set(room.x - room.width * 0.26 + markerIndex * 0.26, 0.24, room.z + room.depth * 0.28);
      marker.visible = false;
      root.add(marker);
    });
  });

  const vacuum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.11, 32),
    new THREE.MeshStandardMaterial({ color: '#68706e', emissive: '#202523', emissiveIntensity: 0.12, roughness: 0.36 }),
  );
  vacuum.name = 'Hotspot_vacuum';
  vacuum.userData.roomId = 'living_dining';
  vacuum.userData.deviceType = 'vacuum';
  vacuum.position.set(-1.35, 0.16, 1.55);
  vacuum.visible = false;
  root.add(vacuum);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#ede9df', roughness: 0.88 });
  D_PLAN_WALLS.forEach(([x1, z1, x2, z2], index) => {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(length, 0.62, 0.12), wallMaterial);
    wall.name = `Wall_${index + 1}`;
    wall.position.set((x1 + x2) / 2, 0.31, (z1 + z2) / 2);
    wall.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    wall.castShadow = true;
    wall.receiveShadow = true;
    root.add(wall);
  });

  return root;
}

