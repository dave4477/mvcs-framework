export default class ViewUtils {

    static disposeGeometry(geometry) {
        if (geometry.dispose) {
        } else if (geometry.length) {
            for (let i = 0; i < geometry.length; i++) {
                ViewUtils.disposeGeometry(geometry[i]);
            }
        }

    }

    static disposeMaps(material) {
        if (material.map && material.dispose) {
            material.map.dispose();
        } else if (material.length) {
            for (let i = 0; i < material.length; i++) {
                ViewUtils.disposeMaps(material[i]);
            }
        }
    }

    static disposeMaterial(material) {
        if (material && material.dispose) {
            material.dispose();
        } else if (material.length) {
            for (let i = 0; i < material.length; i++) {
                ViewUtils.disposeMaterial(material[i]);
            }
        }
    }

    static destroy(object) {

        object.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) {
                    ViewUtils.disposeGeometry(child.geometry);
                }
                if (child.material) {
                    ViewUtils.disposeMaps(child.material);
                    ViewUtils.disposeMaterial(child.material);
                }
            }
        });
    }
}