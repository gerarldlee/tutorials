package monotonic;

public class Monotonic {

    public static boolean monotonic(int[] array) {

        if (array == null || array.length <= 1) return true;

        // determine the trend to be positive or negative
        Boolean postive_trend = null;
        int temp = array[0];

        for (int idx = 1; idx < array.length; idx++) {
            if (postive_trend == null) {
                if (array[idx] > temp) postive_trend = true;
                if (array[idx] < temp) postive_trend = false;
            }

            if (postive_trend != null) {
                if (postive_trend && array[idx] < temp) return false;
                if (!postive_trend && array[idx] > temp) return false;
                temp = array[idx];
            }
        }

        return true;
    }

    public static void main(String[] argvc) {

//        int[] arr = {-1, -5, -10, -1100, -1100, -1101, -1102, -9001};
        int[] arr = {-1, -1, -2, -3, -4, -5, -5, -5, -6, -7, -8, -8, -9, -10, -11};
        System.out.println(monotonic(arr));
    }

}
