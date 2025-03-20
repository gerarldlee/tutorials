package threenumsum;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ThreeNumSum {

/* - o(n^3) time | o(n) space
sort array in ascending order
iterate array
    array2 = subset of array, except for the current int and before
    iterate array2
        array3 = subset of array2, except for the current int
        iterate array3
            if current int of array + array2 + array 3 = targetSum, then
                put these numbers to an array. these are already sorted
                put these array into another array in its element
 */
    public static List<Integer[]> threeNumberSum(int[] array, int targetSum) {
        Arrays.sort(array);
        List<Integer[]> retArr = new ArrayList<>();
        int a_idx = 0;
        while (a_idx < array.length - 3) {
            int a_value = array[a_idx];
            int[] b_array = Arrays.copyOfRange(array, a_idx + 1, array.length);
            int b_idx = 0;
            while (b_idx < b_array.length) {
                int b_value = b_array[b_idx];
                int[] c_array = Arrays.copyOfRange(b_array, b_idx + 1, b_array.length);
                int c_idx = 0;
                while (c_idx < c_array.length) {
                    int c_value = c_array[c_idx];
                    if (a_value + b_value + c_value == targetSum) {
                        Integer[] arr = {a_value, b_value, c_value};
                        retArr.add(arr);
                    }
                    c_idx++;
                }
                b_idx++;
            }
            a_idx++;
        }
        return retArr;
    }

    /* - o(n^2) | o(n)
     sort array in ascending order
     iterate array
         array2 = subset of array, except for the current int
         left = leftmost index
         right = rightmost index
         if (array1 current + left + right == targetSum), then
             put these numbers to an array. no need to sort since its sorted already
             put these array into another array of this array.
         if (array1 current + left + right < targetSum), then
             move left index + 1
             re-compute
         if (array1 current + left + right > targetSum), then
             move right index - 1
             re-compute
      */
    public static List<Integer[]> threeNumberSum1(int[] array, int targetSum) {
        Arrays.sort(array);
        List<Integer[]> retArr = new ArrayList<>();
        int a_idx = 0;
        while (a_idx < array.length - 2) {
            int a_value = array[a_idx];
            int[] b_array = Arrays.copyOfRange(array, a_idx + 1, array.length);
            int l_idx = 0;
            int r_idx = b_array.length - 1;

            determineAndRecurse(a_value, b_array, l_idx, r_idx, targetSum, retArr);

            a_idx++;
        }

        return retArr;
    }

    private static void determineAndRecurse(int a_value, int[] b_array, int l_idx, int r_idx, int targetSum, List<Integer[]> retArr) {
        if (l_idx < r_idx) {
            if (a_value + b_array[l_idx] + b_array[r_idx] < targetSum) {
                // increase left index
                l_idx++;
                determineAndRecurse(a_value, b_array, l_idx, r_idx, targetSum, retArr);
            } else if (a_value + b_array[l_idx] + b_array[r_idx] > targetSum) {
                // decrease right index
                r_idx--;
                determineAndRecurse(a_value, b_array, l_idx, r_idx, targetSum, retArr);
            } else {
                // is equals to the targetSum
                Integer[] arr = {a_value, b_array[l_idx], b_array[r_idx]};
                retArr.add(arr);
                // increase left, and decrease right, and continue for the remaining elements
                l_idx++;
                r_idx--;
                determineAndRecurse(a_value, b_array, l_idx, r_idx, targetSum, retArr);
            }
        }
    }


    public static void main(String[] argv) {
        int[] array = {12, 3,1,2,-6,5,-8, 6};
        System.out.println("" + threeNumberSum1(array, 0));
    }
}
