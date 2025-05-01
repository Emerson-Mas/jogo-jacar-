
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let input = { left: false, right: false, jump: false };

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") input.left = true;
  if (e.key === "ArrowRight" || e.key === "d") input.right = true;
  if (e.key === " " || e.key === "ArrowUp") input.jump = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") input.left = false;
  if (e.key === "ArrowRight" || e.key === "d") input.right = false;
  if (e.key === " " || e.key === "ArrowUp") input.jump = false;
});

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.5, 0.8, 1.0);

  const camera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 2, -10), scene);
  camera.radius = 10;
  camera.heightOffset = 2;
  camera.rotationOffset = 0;
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 10}, scene);

  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "Jacaré_0501134656_texture.fbx", scene);
  const jacare = result.meshes[0];
  const skeleton = result.skeletons[0];
  jacare.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
  jacare.position = new BABYLON.Vector3(0, 0, 0);
  camera.lockedTarget = jacare;

  let currentAnim = null;
  const animations = {};

  const loadAnim = async (name, file) => {
    const animResult = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", file, scene);
    const animGroup = animResult.animationGroups[0];
    animations[name] = animGroup;
    animGroup.stop();
  };

  await loadAnim("idle", "Idle.fbx");
  await loadAnim("walk", "Walking.fbx");
  await loadAnim("run", "Running.fbx");
  await loadAnim("jump", "Jumping.fbx");

  const playAnim = (name) => {
    if (currentAnim === name) return;
    if (currentAnim) animations[currentAnim].stop();
    animations[name].play(true);
    currentAnim = name;
  };

  playAnim("idle");

  scene.onBeforeRenderObservable.add(() => {
    const delta = engine.getDeltaTime() / 1000;
    let moved = false;

    if (input.left) {
      jacare.position.x -= 3 * delta;
      jacare.rotation.y = Math.PI;
      playAnim("walk");
      moved = true;
    }
    if (input.right) {
      jacare.position.x += 3 * delta;
      jacare.rotation.y = 0;
      playAnim("walk");
      moved = true;
    }
    if (input.jump) {
      playAnim("jump");
      moved = true;
    }
    if (!moved) {
      playAnim("idle");
    }
  });

  return scene;
};

createScene().then((scene) => {
  engine.runRenderLoop(() => scene.render());
});
window.addEventListener("resize", () => engine.resize());
