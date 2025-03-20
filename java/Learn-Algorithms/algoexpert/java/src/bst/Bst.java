package bst;

public class Bst {

    int value;
    Bst left;
    Bst right;

    public Bst(int value) {
        this.value = value;
    }

    public Bst insert(int value) {
        // locate nearest BST first relative to this
        Bst bst = locate(value, this);
        return this;
    }

    private Bst locate(int value, Bst bst) {
        if (bst.value == value) return bst;
        if (value < bst.value) {
            // search to the left
            if (left == null) {
                Bst l = new Bst(value);
                left = l;
            }
            else {
                // check if the left node value is
            }
        }
        if (value > bst.value) {
            // search to the right
        }
    }

    // cannot remove from single node tree
    public Bst remove(int value) {

        return this;
    }

    public boolean contains(int value) {
        return contains(value, this);
    }

    private boolean contains(int value, Bst bst) {
        if (this.value == value) return true;
        if (value < this.value && this.left != null) {
            return contains(value, this.left);
        }
        if (value > this.value && this.right != null) {
            return contains(value, this.right);
        }
        return false;
    }

}
