package moveelementtoend;

import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

public class MoveElementEnd {

//    public static List<Integer> moveElementToEnd(List<Integer> array, int toMove) {
//
//        int[] arr = array.toArray(new int[array.size()]);
//
//    }

//    public static int[] moveElementToEnd(int[] array, int num) {

    public static List<Integer> moveElementToEnd(List<Integer> array, int toMove) {

        LinkedList<Integer> ar = new LinkedList<>(array);

        int idx = ar.size();
        while (idx >= 0) {
            int value = ar.get(idx);
            if (value == toMove) {
                ar.remove(idx);
                ar.offer(value);
            }
            idx--;
        }
        return ar;
//        return array;
    }

    private static void shift(int[] array, int idx) {
        int v = array[idx];
        for (int shift_idx = idx; shift_idx < array.length; shift_idx++) {
            array[shift_idx] = array[shift_idx + 1];
        }
        array[array.length - 1] = v;
    }
}
