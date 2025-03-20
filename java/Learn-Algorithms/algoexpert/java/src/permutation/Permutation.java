package permutation;

import java.util.ArrayList;
import java.util.List;

public class Permutation {

    public static List<List<Integer>> getPermutations(List<Integer> array) {
        List<List<Integer>> answers = new ArrayList<List<Integer>>();

        List<Integer> arrayCopy = new ArrayList<>(array);
        for (int i = 0; i < arrayCopy.size(); i++) {
            int i_value = arrayCopy.remove(i);
            for (int y = 0; y < arrayCopy.size(); y++) {
                int y_
            }
        }


        return answers;
    }

}
